using MACI.Core.Enums;

namespace MACI.Core.Models;

public class CodeCandidate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PipelineRunId { get; set; }
    public int Iteration { get; set; } = 0;
    public string Code { get; set; } = string.Empty;
    public string? CotTrace { get; set; }
    public GenerationTechnique Technique { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}