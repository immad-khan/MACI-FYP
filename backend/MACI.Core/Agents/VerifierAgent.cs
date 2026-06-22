using System.Text.Json;
using System.Text.RegularExpressions;
using MACI.Core.Agents.Interfaces;
using MACI.Core.Enums;
using MACI.Core.Models;
using MACI.Core.Options;
using MACI.Core.Prompts;
using MACI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MACI.Core.Agents;

public class VerifierAgent : IVerifierAgent
{
    private readonly ICodeExecutorService _executorService;
    private readonly IGroqService _groqService;
    private readonly ILogger<VerifierAgent> _logger;
    private readonly string _apiKey;

    public VerifierAgent(
        ICodeExecutorService executorService,
        IGroqService groqService,
        IOptions<GroqOptions> options,
        ILogger<VerifierAgent> logger)
    {
        _executorService = executorService;
        _groqService = groqService;
        _logger = logger;
        _apiKey = options.Value.VerifierAgentApiKey;
    }

    public async Task<BugReport> VerifyAsync(
        CodeCandidate candidate,
        StructuredSpec spec,
        List<TestCase> testCases,
        int iteration,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Verifier Agent verifying code (iteration {Iteration})",
            iteration);

        var bugReport = new BugReport
        {
            PipelineRunId = candidate.PipelineRunId,
            Iteration = iteration
        };

        // Step 1: Execute the code
        ExecutionResult executionResult;

        if (testCases.Any())
        {
            executionResult = await _executorService.ExecuteWithTestCasesAsync(
                candidate.Code,
                testCases,
                ct);
        }
        else
        {
            executionResult = await _executorService.ExecuteAsync(
                candidate.Code,
                null,
                ct);
        }

        // Fill execution details
        bugReport.Stdout = executionResult.Stdout;
        bugReport.Stderr = executionResult.Stderr;
        bugReport.ExitCode = executionResult.ExitCode;
        bugReport.TimedOut = executionResult.TimedOut;
        bugReport.ExecutionTimeMs = executionResult.ExecutionTimeMs;

        _logger.LogInformation(
            "Execution completed. Success: {Success}, ExitCode: {ExitCode}, TimedOut: {TimedOut}",
            executionResult.Success,
            executionResult.ExitCode,
            executionResult.TimedOut);

        // Step 2: If execution failed, classify the bug
        if (!executionResult.Success || executionResult.TimedOut)
        {
            await ClassifyBugAsync(candidate.Code, executionResult, bugReport, ct);
        }

        // Step 3: Run basic static analysis
        bugReport.SemgrepFindings = RunBasicStaticAnalysis(candidate.Code);

        if (bugReport.SemgrepFindings.Any())
        {
            _logger.LogWarning(
                "Static analysis found {Count} issues",
                bugReport.SemgrepFindings.Count);
        }

        // Final status
        if (bugReport.IsClean)
        {
            _logger.LogInformation("✅ Code is CLEAN — no bugs detected");
        }
        else
        {
            _logger.LogWarning(
                "⚠️ Bugs detected: {Primary}/{Secondary}",
                bugReport.PrimaryType,
                bugReport.SecondaryType);
        }

        return bugReport;
    }

    private async Task ClassifyBugAsync(
        string code,
        ExecutionResult executionResult,
        BugReport bugReport,
        CancellationToken ct)
    {
        _logger.LogInformation("Classifying bug using LLM...");

        // First try rule-based (fast)
        if (TryRuleBasedClassification(executionResult, bugReport))
        {
            _logger.LogInformation(
                "Rule-based classification: {Primary}/{Secondary}",
                bugReport.PrimaryType,
                bugReport.SecondaryType);
            return;
        }

        // Fall back to LLM classification
        try
        {
            var classificationPrompt = VerifierAgentPrompts.BuildClassificationPrompt(
                code,
                executionResult.Stderr,
                executionResult.Stdout,
                executionResult.ExitCode,
                executionResult.TimedOut);

            var response = await _groqService.CompleteAsync(
                VerifierAgentPrompts.BugClassificationPrompt,
                classificationPrompt,
                _apiKey,
                ct);

            var jsonContent = ExtractJson(response);
            var classification = JsonSerializer.Deserialize<BugClassification>(
                jsonContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (classification != null)
            {
                bugReport.PrimaryType = Enum.Parse<BugPrimaryType>(classification.PrimaryType);
                bugReport.SecondaryType = Enum.Parse<BugSecondaryType>(classification.SecondaryType);
                bugReport.BugDescription = classification.BugDescription;
                bugReport.BugLocation = classification.BugLocation;

                _logger.LogInformation(
                    "LLM classification: {Primary}/{Secondary}",
                    bugReport.PrimaryType,
                    bugReport.SecondaryType);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LLM classification failed, using fallback");
            bugReport.PrimaryType = BugPrimaryType.Runtime;
            bugReport.SecondaryType = BugSecondaryType.UndefinedVariable;
            bugReport.BugDescription = "Classification failed: " + ex.Message;
        }
    }

    private bool TryRuleBasedClassification(
        ExecutionResult executionResult,
        BugReport bugReport)
    {
        var stderr = executionResult.Stderr.ToLower();

        if (executionResult.TimedOut)
        {
            bugReport.PrimaryType = BugPrimaryType.Runtime;
            bugReport.SecondaryType = BugSecondaryType.InfiniteLoop;
            bugReport.BugDescription = "Code exceeded 10 second timeout — likely infinite loop";
            bugReport.BugLocation = "Unknown";
            return true;
        }

        if (stderr.Contains("syntaxerror"))
        {
            bugReport.PrimaryType = BugPrimaryType.Syntax;
            bugReport.SecondaryType = stderr.Contains("expected ':'") || stderr.Contains("invalid syntax")
                ? BugSecondaryType.MissingColon
                : BugSecondaryType.IndentationError;
            bugReport.BugDescription = "Python syntax error detected";
            bugReport.BugLocation = ExtractLineNumber(stderr);
            return true;
        }

        if (stderr.Contains("indentationerror"))
        {
            bugReport.PrimaryType = BugPrimaryType.Syntax;
            bugReport.SecondaryType = BugSecondaryType.IndentationError;
            bugReport.BugDescription = "Incorrect indentation";
            bugReport.BugLocation = ExtractLineNumber(stderr);
            return true;
        }

        if (stderr.Contains("nameerror") || stderr.Contains("not defined"))
        {
            bugReport.PrimaryType = BugPrimaryType.Runtime;
            bugReport.SecondaryType = BugSecondaryType.UndefinedVariable;
            bugReport.BugDescription = "Variable used before definition";
            bugReport.BugLocation = ExtractLineNumber(stderr);
            return true;
        }

        if (stderr.Contains("typeerror"))
        {
            bugReport.PrimaryType = BugPrimaryType.Runtime;
            bugReport.SecondaryType = BugSecondaryType.TypeMismatch;
            bugReport.BugDescription = "Type mismatch in operation";
            bugReport.BugLocation = ExtractLineNumber(stderr);
            return true;
        }

        if (stderr.Contains("indexerror"))
        {
            bugReport.PrimaryType = BugPrimaryType.Runtime;
            bugReport.SecondaryType = BugSecondaryType.IndexOutOfBounds;
            bugReport.BugDescription = "List/array index out of range";
            bugReport.BugLocation = ExtractLineNumber(stderr);
            return true;
        }

        if (stderr.Contains("attributeerror") || stderr.Contains("nonetype"))
        {
            bugReport.PrimaryType = BugPrimaryType.Runtime;
            bugReport.SecondaryType = BugSecondaryType.NullReference;
            bugReport.BugDescription = "Null reference error";
            bugReport.BugLocation = ExtractLineNumber(stderr);
            return true;
        }

        if (stderr.Contains("expected:") || stderr.Contains("actual:"))
        {
            bugReport.PrimaryType = BugPrimaryType.Functional;
            bugReport.SecondaryType = BugSecondaryType.WrongOutput;
            bugReport.BugDescription = "Code runs but produces incorrect output";
            bugReport.BugLocation = "Output comparison";
            return true;
        }

        return false;
    }

    private List<StaticAnalysisFinding> RunBasicStaticAnalysis(string code)
    {
        var findings = new List<StaticAnalysisFinding>();

        if (code.Contains("eval(") || code.Contains("exec("))
        {
            findings.Add(new StaticAnalysisFinding
            {
                Tool = "BasicAnalyzer",
                RuleId = "dangerous-eval",
                Message = "Avoid using eval() or exec() — security risk",
                Severity = "ERROR",
                Line = null
            });
        }

        if (Regex.IsMatch(code, @"#\s*(TODO|FIXME)", RegexOptions.IgnoreCase))
        {
            findings.Add(new StaticAnalysisFinding
            {
                Tool = "BasicAnalyzer",
                RuleId = "incomplete-code",
                Message = "Code contains TODO/FIXME comments",
                Severity = "WARNING",
                Line = null
            });
        }

        if (Regex.IsMatch(code, @"^\s*pass\s*$", RegexOptions.Multiline))
        {
            findings.Add(new StaticAnalysisFinding
            {
                Tool = "BasicAnalyzer",
                RuleId = "empty-function",
                Message = "Function contains only 'pass' — incomplete implementation",
                Severity = "WARNING",
                Line = null
            });
        }

        return findings;
    }

    private static string ExtractLineNumber(string stderr)
    {
        var match = Regex.Match(stderr, @"line (\d+)", RegexOptions.IgnoreCase);
        return match.Success ? $"Line {match.Groups[1].Value}" : "Unknown";
    }

    private static string ExtractJson(string response)
    {
        var json = response.Trim();
        if (json.StartsWith("```json")) json = json[7..];
        else if (json.StartsWith("```")) json = json[3..];
        if (json.EndsWith("```")) json = json[..^3];
        return json.Trim();
    }

    private class BugClassification
    {
        public string PrimaryType { get; set; } = string.Empty;
        public string SecondaryType { get; set; } = string.Empty;
        public string BugDescription { get; set; } = string.Empty;
        public string BugLocation { get; set; } = string.Empty;
    }
}