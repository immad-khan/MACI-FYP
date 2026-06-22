using Microsoft.AspNetCore.Mvc;
using MACI.Core.Agents.Interfaces;
using MACI.Core.Models;

namespace MACI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly IMasterAgent _masterAgent;
    private readonly IWriterAgent _writerAgent;
    private readonly IVerifierAgent _verifierAgent;
    private readonly ILogger<TestController> _logger;

    public TestController(
        IMasterAgent masterAgent,
        IWriterAgent writerAgent,
        IVerifierAgent verifierAgent,
        ILogger<TestController> logger)
    {
        _masterAgent = masterAgent;
        _writerAgent = writerAgent;
        _verifierAgent = verifierAgent;
        _logger = logger;
    }

    [HttpPost("pipeline")]
    public async Task<IActionResult> RunPipeline([FromBody] PipelineRequest request)
    {
        var startTime = DateTime.UtcNow;
        
        try
        {
            _logger.LogInformation("🚀 PIPELINE STARTED for: {Title}", request.Title);

            // ============================================
            // STEP 1: MASTER AGENT
            // ============================================
            _logger.LogInformation("📋 MASTER AGENT: Decomposing problem...");
            
            var problem = new Problem
            {
                Title = request.Title,
                Description = request.Description,
                TestCases = request.TestCases ?? new()
            };

            var spec = await _masterAgent.DecomposeAsync(problem);
            
            _logger.LogInformation("✅ MASTER AGENT: Created spec for function '{FunctionName}'", spec.FunctionName);

            // ============================================
            // STEP 2: WRITER AGENT
            // ============================================
            _logger.LogInformation("✍️ WRITER AGENT: Generating code...");
            
            var candidate = await _writerAgent.GenerateAsync(spec);
            candidate.PipelineRunId = Guid.NewGuid();
            
            _logger.LogInformation("✅ WRITER AGENT: Generated {Length} characters of code", candidate.Code.Length);
            _logger.LogInformation("📝 Generated Code:\n{Code}", candidate.Code);

            // ============================================
            // STEP 3: VERIFIER AGENT
            // ============================================
            _logger.LogInformation("🔍 VERIFIER AGENT: Executing and verifying code...");
            
            var bugReport = await _verifierAgent.VerifyAsync(
                candidate,
                spec,
                problem.TestCases,
                0);

            if (bugReport.HasBug)
            {
                _logger.LogWarning(
                    "⚠️ VERIFIER AGENT: Bugs detected - {Primary}/{Secondary}",
                    bugReport.PrimaryType,
                    bugReport.SecondaryType);
            }
            else
            {
                _logger.LogInformation("✅ VERIFIER AGENT: Code is CLEAN - no bugs detected");
            }

            var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;

            // ============================================
            // RETURN DETAILED RESPONSE FOR FRONTEND
            // ============================================
            return Ok(new PipelineResponse
            {
                PipelineId = candidate.PipelineRunId,
                DurationMs = (int)duration,
                
                MasterAgentOutput = new MasterAgentOutput
                {
                    FunctionName = spec.FunctionName,
                    FunctionSignature = spec.FunctionSignature,
                    Parameters = spec.Parameters.Select(p => new ParameterInfo
                    {
                        Name = p.Name,
                        Type = p.Type,
                        Description = p.Description
                    }).ToList(),
                    ProblemSummary = spec.ProblemSummary,
                    Constraints = spec.Constraints,
                    EdgeCases = spec.EdgeCases,
                    Examples = spec.Examples.Select(e => new ExampleInfo
                    {
                        Input = e.Input,
                        Output = e.Output
                    }).ToList()
                },
                
                WriterAgentOutput = new WriterAgentOutput
                {
                    GeneratedCode = candidate.Code,
                    Technique = candidate.Technique.ToString(),
                    CotTrace = candidate.CotTrace
                },
                
                VerifierAgentOutput = new VerifierAgentOutput
                {
                    HasBugs = bugReport.HasBug,
                    IsClean = bugReport.IsClean,
                    ExecutionPassed = !bugReport.HasBug,
                    PrimaryBugType = bugReport.PrimaryType?.ToString(),
                    SecondaryBugType = bugReport.SecondaryType?.ToString(),
                    BugDescription = bugReport.BugDescription,
                    BugLocation = bugReport.BugLocation,
                    Stdout = bugReport.Stdout,
                    Stderr = bugReport.Stderr,
                    ExitCode = bugReport.ExitCode,
                    TimedOut = bugReport.TimedOut,
                    ExecutionTimeMs = bugReport.ExecutionTimeMs,
                    StaticAnalysisFindings = bugReport.SemgrepFindings.Select(f => new FindingInfo
                    {
                        Tool = f.Tool,
                        RuleId = f.RuleId,
                        Message = f.Message,
                        Severity = f.Severity,
                        Line = f.Line
                    }).ToList()
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ PIPELINE FAILED: {Message}", ex.Message);
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }
}

// ============================================
// REQUEST/RESPONSE DTOs
// ============================================

public class PipelineRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<TestCase>? TestCases { get; set; }
}

public class PipelineResponse
{
    public Guid PipelineId { get; set; }
    public int DurationMs { get; set; }
    public MasterAgentOutput MasterAgentOutput { get; set; } = new();
    public WriterAgentOutput WriterAgentOutput { get; set; } = new();
    public VerifierAgentOutput VerifierAgentOutput { get; set; } = new();
}

public class MasterAgentOutput
{
    public string FunctionName { get; set; } = string.Empty;
    public string FunctionSignature { get; set; } = string.Empty;
    public List<ParameterInfo> Parameters { get; set; } = new();
    public string ProblemSummary { get; set; } = string.Empty;
    public List<string> Constraints { get; set; } = new();
    public List<string> EdgeCases { get; set; } = new();
    public List<ExampleInfo> Examples { get; set; } = new();
}

public class WriterAgentOutput
{
    public string GeneratedCode { get; set; } = string.Empty;
    public string Technique { get; set; } = string.Empty;
    public string? CotTrace { get; set; }
}

public class VerifierAgentOutput
{
    public bool HasBugs { get; set; }
    public bool IsClean { get; set; }
    public bool ExecutionPassed { get; set; }
    public string? PrimaryBugType { get; set; }
    public string? SecondaryBugType { get; set; }
    public string? BugDescription { get; set; }
    public string? BugLocation { get; set; }
    public string? Stdout { get; set; }
    public string? Stderr { get; set; }
    public int ExitCode { get; set; }
    public bool TimedOut { get; set; }
    public long ExecutionTimeMs { get; set; }
    public List<FindingInfo> StaticAnalysisFindings { get; set; } = new();
}

public class ParameterInfo
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ExampleInfo
{
    public string Input { get; set; } = string.Empty;
    public string Output { get; set; } = string.Empty;
}

public class FindingInfo
{
    public string Tool { get; set; } = string.Empty;
    public string RuleId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public int? Line { get; set; }
}