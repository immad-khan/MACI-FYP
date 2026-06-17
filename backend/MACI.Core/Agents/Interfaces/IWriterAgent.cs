using MACI.Core.Models;

namespace MACI.Core.Agents.Interfaces;

public interface IWriterAgent
{
    Task<CodeCandidate> GenerateAsync(StructuredSpec spec, CancellationToken ct = default);
    
    Task<CodeCandidate> RepairAsync(
        StructuredSpec spec,
        CodeCandidate failedCandidate,
        BugReport bugReport,
        int iteration,
        CancellationToken ct = default);
}