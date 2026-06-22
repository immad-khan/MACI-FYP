using System.Text.Json;
using MACI.Core.Agents.Interfaces;
using MACI.Core.Models;
using MACI.Core.Options;
using MACI.Core.Prompts;
using MACI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MACI.Core.Agents;

public class MasterAgent : IMasterAgent
{
    private readonly IGroqService _groqService;
    private readonly ILogger<MasterAgent> _logger;
    private readonly string _apiKey;

    public MasterAgent(
        IGroqService groqService,
        IOptions<GroqOptions> options,
        ILogger<MasterAgent> logger)
    {
        _groqService = groqService;
        _logger = logger;
        _apiKey = options.Value.MasterAgentApiKey;
    }

    public async Task<StructuredSpec> DecomposeAsync(
        Problem problem,
        CancellationToken ct = default)
    {
        _logger.LogInformation("👑 Master Agent decomposing: {Title}", problem.Title);

        var response = await _groqService.CompleteAsync(
            MasterAgentPrompts.SystemPrompt,
            MasterAgentPrompts.BuildUserPrompt(problem.Description),
            _apiKey,
            ct);

        var jsonContent = ExtractJson(response);

        try
        {
            var spec = JsonSerializer.Deserialize<StructuredSpec>(
                jsonContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (spec == null)
                throw new InvalidOperationException("Failed to parse StructuredSpec");

            _logger.LogInformation("✅ Master Agent spec created for: {FunctionName}", spec.FunctionName);
            return spec;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse Master Agent JSON");
            throw new InvalidOperationException("Master Agent returned invalid JSON: " + jsonContent, ex);
        }
    }

    public async Task<bool> QualityGateAsync(PipelineRun run, CancellationToken ct = default)
    {
        _logger.LogInformation("👑 Master Agent quality gate for run {RunId}", run.Id);

        if (!run.ExecutionPassed)
        {
            run.QualityGateReason = "Code did not pass execution tests";
            return false;
        }

        var latestBugReport = run.BugReports.OrderByDescending(b => b.Iteration).FirstOrDefault();
        if (latestBugReport?.HasBug == true)
        {
            run.QualityGateReason = "Latest execution still has bugs";
            return false;
        }

        run.QualityGateReason = "All quality checks passed";
        _logger.LogInformation("✅ Quality gate PASSED for run {RunId}", run.Id);
        return true;
    }

    private static string ExtractJson(string response)
    {
        var json = response.Trim();
        if (json.StartsWith("```json")) json = json[7..];
        else if (json.StartsWith("```")) json = json[3..];
        if (json.EndsWith("```")) json = json[..^3];
        return json.Trim();
    }
}