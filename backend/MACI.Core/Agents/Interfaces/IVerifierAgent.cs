using MACI.Core.Models;

namespace MACI.Core.Agents.Interfaces;

public interface IVerifierAgent
{
    Task<BugReport> VerifyAsync(
        CodeCandidate candidate,
        StructuredSpec spec,
        List<TestCase> testCases,
        int iteration,
        CancellationToken ct = default);
}