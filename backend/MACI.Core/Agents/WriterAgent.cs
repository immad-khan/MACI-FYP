using MACI.Core.Agents.Interfaces;
using MACI.Core.Enums;
using MACI.Core.Models;
using MACI.Core.Options;
using MACI.Core.Prompts;
using MACI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MACI.Core.Agents;

public class WriterAgent : IWriterAgent
{
    private readonly IGroqService _groqService;
    private readonly ILogger<WriterAgent> _logger;
    private readonly string _apiKey;

    public WriterAgent(
        IGroqService groqService,
        IOptions<GroqOptions> options,
        ILogger<WriterAgent> logger)
    {
        _groqService = groqService;
        _logger = logger;
        _apiKey = options.Value.WriterAgentApiKey;
    }

    public async Task<CodeCandidate> GenerateAsync(
        StructuredSpec spec,
        CancellationToken ct = default)
    {
        _logger.LogInformation("✍️ Writer Agent generating for: {FunctionName}", spec.FunctionName);

        var response = await _groqService.CompleteAsync(
            WriterAgentPrompts.SystemPrompt,
            WriterAgentPrompts.BuildGenerationPrompt(spec),
            _apiKey,
            ct);

        var code = ExtractPythonCode(response);

        _logger.LogInformation("✅ Writer Agent generated {Length} chars", code.Length);
        _logger.LogInformation("📝 Code:\n{Code}", code);

        return new CodeCandidate
        {
            Code = code,
            CotTrace = response,
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
            "✍️ Writer Agent repairing (iteration {Iteration}). Bug: {Primary}/{Secondary}",
            iteration,
            bugReport.PrimaryType,
            bugReport.SecondaryType);

        var response = await _groqService.CompleteAsync(
            WriterAgentPrompts.RepairSystemPrompt,
            WriterAgentPrompts.BuildRepairPrompt(spec, failedCandidate.Code, bugReport),
            _apiKey,
            ct);

        var code = ExtractPythonCode(response);

        _logger.LogInformation("✅ Writer Agent repaired code ({Length} chars)", code.Length);

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
                break;
            if (inCodeBlock)
                codeLines.Add(line);
        }

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