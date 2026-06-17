using MACI.Core.Enums;

namespace MACI.Core.Models;

public class PipelineRun
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProblemId { get; set; }
    public PipelineStatus Status { get; set; } = PipelineStatus.Pending;

    public StructuredSpec? StructuredSpec { get; set; }
    public CodeCandidate? SelectedCandidate { get; set; }
    public List<BugReport> BugReports { get; set; } = new();

    public int CurrentIteration { get; set; } = 0;
    public int MaxIterations { get; set; } = 2;
    public bool ExecutionPassed { get; set; }

    public bool? QualityGatePassed { get; set; }
    public string? QualityGateReason { get; set; }

    public string? FinalCode { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public int? DurationMs => CompletedAt.HasValue
        ? (int)(CompletedAt.Value - StartedAt).TotalMilliseconds
        : null;
}