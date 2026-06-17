using MACI.Core.Models;

namespace MACI.Core.Agents.Interfaces;

public interface IMasterAgent
{
    Task<StructuredSpec> DecomposeAsync(Problem problem, CancellationToken ct = default);
    Task<bool> QualityGateAsync(PipelineRun run, CancellationToken ct = default);
}