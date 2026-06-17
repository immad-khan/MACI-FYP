using MACI.Core.Agents.Interfaces;
using MACI.Core.Enums;
using MACI.Core.Models;
using MACI.Core.Prompts;
using MACI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace MACI.Core.Agents;

public class WriterAgent : IWriterAgent
{
    private readonly IGroqService _groqService;
    private readonly ILogger<WriterAgent> _logger;

    public WriterAgent(IGroqService groqService, ILogger<WriterAgent> logger)
    {
        _groqService = groqService;
        _logger = logger;
    }

    public async Task<CodeCandidate> GenerateAsync(
        StructuredSpec spec,
        CancellationToken ct = default)
    {
        _logger.LogInformation("Writer Agent generating code for: {FunctionName}", spec.FunctionName);

        var userPrompt = WriterAgentPrompts.BuildGenerationPrompt(spec);
        var response = await _groqService.CompleteAsync(
            WriterAgentPrompts.SystemPrompt,
            userPrompt,
            ct);

        var code = ExtractPythonCode(response);

        _logger.LogInformation("Writer Agent generated {Length} characters of code", code.Length);

        return new CodeCandidate
        {
            Code = code,
            CotTrace = response, // Full response includes reasoning
            Technique = GenerationTechnique.ChainOfThought,
            Iteration = 0
        };
    }

    public async Task<CodeCandidate> RepairAsync(
        StructuredSpec spec,
        CodeCandidate failedCandidate,
        BugReport bugReport,
        int iteration,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Writer Agent repairing code (iteration {Iteration}). Bug: {PrimaryType}/{SecondaryType}",
            iteration,
            bugReport.PrimaryType,
            bugReport.SecondaryType);

        var userPrompt = WriterAgentPrompts.BuildRepairPrompt(
            spec,
            failedCandidate.Code,
            bugReport);

        var response = await _groqService.CompleteAsync(
            WriterAgentPrompts.RepairSystemPrompt,
            userPrompt,
            ct);

        var code = ExtractPythonCode(response);

        _logger.LogInformation("Writer Agent produced repaired code ({Length} chars)", code.Length);

        return new CodeCandidate
        {
            Code = code,
            CotTrace = response,
            Technique = GenerationTechnique.ChainOfThought,
            Iteration = iteration
        };
    }

    private static string ExtractPythonCode(string response)
    {
        var lines = response.Split('\n');
        var codeLines = new List<string>();
        var inCodeBlock = false;

        foreach (var line in lines)
        {
            if (line.Trim().StartsWith("```python"))
            {
                inCodeBlock = true;
                continue;
            }

            if (line.Trim().StartsWith("```") && inCodeBlock)
            {
                break;
            }

            if (inCodeBlock)
            {
                codeLines.Add(line);
            }
        }

        // If no code block found, try to extract def ... block
        if (codeLines.Count == 0)
        {
            var defFound = false;
            foreach (var line in lines)
            {
                if (line.TrimStart().StartsWith("def "))
                    defFound = true;

                if (defFound)
                    codeLines.Add(line);
            }
        }

        return string.Join('\n', codeLines).Trim();
    }
}