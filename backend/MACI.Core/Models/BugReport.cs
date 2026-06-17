using MACI.Core.Enums;

namespace MACI.Core.Models;

public class BugReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PipelineRunId { get; set; }
    public int Iteration { get; set; }

    public string? Stdout { get; set; }
    public string? Stderr { get; set; }
    public int ExitCode { get; set; }
    public bool TimedOut { get; set; }
    public long ExecutionTimeMs { get; set; }

    public BugPrimaryType? PrimaryType { get; set; }
    public BugSecondaryType? SecondaryType { get; set; }
    public string? BugDescription { get; set; }
    public string? BugLocation { get; set; }

    public List<StaticAnalysisFinding> SemgrepFindings { get; set; } = new();

    public string? RepairPromptSent { get; set; }
    public bool WasRepaired { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool HasBug => PrimaryType != null || TimedOut;
    public bool IsClean => !HasBug && SemgrepFindings.Count == 0;
}

public class StaticAnalysisFinding
{
    public string Tool { get; set; } = string.Empty;
    public string RuleId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public int? Line { get; set; }
}