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

    [HttpPost("simple-flow")]
    public async Task<IActionResult> TestSimpleFlow([FromBody] TestRequest request)
    {
        try
        {
            _logger.LogInformation("Starting simple test flow");

            // Step 1: Master Agent
            var problem = new Problem
            {
                Title = request.Title,
                Description = request.Description,
                TestCases = request.TestCases ?? new()
            };

            var spec = await _masterAgent.DecomposeAsync(problem);

            // Step 2: Writer Agent
            var candidate = await _writerAgent.GenerateAsync(spec);
            candidate.PipelineRunId = Guid.NewGuid();

            // Step 3: Verifier Agent
            var bugReport = await _verifierAgent.VerifyAsync(
                candidate,
                spec,
                problem.TestCases,
                0);

            return Ok(new
            {
                spec,
                code = candidate.Code,
                bugReport = new
                {
                    hasbugs = bugReport.HasBug,
                    primaryType = bugReport.PrimaryType?.ToString(),
                    secondaryType = bugReport.SecondaryType?.ToString(),
                    description = bugReport.BugDescription,
                    stderr = bugReport.Stderr,
                    stdout = bugReport.Stdout,
                    staticAnalysisFindings = bugReport.SemgrepFindings
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Test flow failed");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class TestRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<TestCase>? TestCases { get; set; }
}