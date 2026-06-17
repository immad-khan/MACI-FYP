
using MACI.Core.Enums;

namespace MACI.Core.Prompts;

public static class VerifierAgentPrompts
{
    public const string BugClassificationPrompt = @"You are the Verifier Agent's bug classification system.

Given execution results, classify the bug into:

PRIMARY TYPES (choose ONE):
1. Syntax — code doesn't parse/compile
2. Runtime — code runs but crashes
3. Functional — code runs but produces wrong output

SECONDARY TYPES (choose ONE):
Syntax:
  - MissingColon
  - IndentationError

Runtime:
  - UndefinedVariable
  - TypeMismatch
  - IndexOutOfBounds
  - NullReference
  - InfiniteLoop

Functional:
  - WrongAlgorithm
  - WrongOutput
  - EdgeCaseFailure

Output ONLY valid JSON:
{
  ""primaryType"": ""Syntax|Runtime|Functional"",
  ""secondaryType"": ""one of the 10 types above"",
  ""bugDescription"": ""brief description of what went wrong"",
  ""bugLocation"": ""which line or section has the bug""
}";

    public static string BuildClassificationPrompt(
        string code,
        string stderr,
        string stdout,
        int exitCode,
        bool timedOut)
    {
        return $@"Classify this bug:

CODE:
```python
{code}
EXECUTION RESULTS:

Exit Code: {exitCode}
Timed Out: {timedOut}
Standard Error:
{stderr}
Standard Output:
{stdout}
Analyze the error and classify it.";
}
}

text


---

## 📁 `MACI.Core/Agents/MasterAgent.cs`

```csharp
using System.Text.Json;
using MACI.Core.Agents.Interfaces;
using MACI.Core.Models;
using MACI.Core.Prompts;
using MACI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace MACI.Core.Agents;

public class MasterAgent : IMasterAgent
{
    private readonly IGroqService _groqService;
    private readonly ILogger<MasterAgent> _logger;

    public MasterAgent(IGroqService groqService, ILogger<MasterAgent> logger)
    {
        _groqService = groqService;
        _logger = logger;
    }

    public async Task<StructuredSpec> DecomposeAsync(
        Problem problem,
        CancellationToken ct = default)
    {
        _logger.LogInformation("Master Agent decomposing problem: {Title}", problem.Title);

        var userPrompt = MasterAgentPrompts.BuildUserPrompt(problem.Description);
        var response = await _groqService.CompleteAsync(
            MasterAgentPrompts.SystemPrompt,
            userPrompt,
            ct);

        _logger.LogDebug("Master Agent raw response: {Response}", response);

        // Extract JSON from markdown code block if present
        var jsonContent = ExtractJson(response);

        try
        {
            var spec = JsonSerializer.Deserialize<StructuredSpec>(
                jsonContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (spec == null)
                throw new InvalidOperationException("Failed to parse StructuredSpec");

            _logger.LogInformation(
                "Master Agent produced spec for function: {FunctionName}",
                spec.FunctionName);

            return spec;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse JSON response from Master Agent");
            throw new InvalidOperationException(
                "Master Agent returned invalid JSON. Response: " + jsonContent, ex);
        }
    }

    public async Task<bool> QualityGateAsync(
        PipelineRun run,
        CancellationToken ct = default)
    {
        _logger.LogInformation("Master Agent evaluating quality gate for run {RunId}", run.Id);

        // Simple quality gate rules (can be made more sophisticated)
        
        // Must have passed execution
        if (!run.ExecutionPassed)
        {
            run.QualityGateReason = "Code did not pass execution tests";
            return false;
        }

        // Must not have exceeded max iterations
        if (run.CurrentIteration >= run.MaxIterations && !run.ExecutionPassed)
        {
            run.QualityGateReason = $"Exceeded max repair iterations ({run.MaxIterations})";
            return false;
        }

        // Check if final bug report shows any issues
        var latestBugReport = run.BugReports.OrderByDescending(b => b.Iteration).FirstOrDefault();
        if (latestBugReport?.HasBug == true)
        {
            run.QualityGateReason = "Latest execution still has bugs";
            return false;
        }

        // All checks passed
        run.QualityGateReason = "All quality checks passed";
        _logger.LogInformation("Quality gate PASSED for run {RunId}", run.Id);
        return true;
    }

    private static string ExtractJson(string response)
    {
        // Remove markdown code blocks if present
        var json = response.Trim();
        
        if (json.StartsWith("```json"))
            json = json[7..];
        else if (json.StartsWith("```"))
            json = json[3..];
        
        if (json.EndsWith("```"))
            json = json[..^3];

        return json.Trim();
    }
}
