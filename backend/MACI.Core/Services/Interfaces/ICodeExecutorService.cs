using MACI.Core.Models;

namespace MACI.Core.Services.Interfaces;

public interface ICodeExecutorService
{
    Task<ExecutionResult> ExecuteAsync(
        string pythonCode,
        string? testInput = null,
        CancellationToken ct = default);

    Task<ExecutionResult> ExecuteWithTestCasesAsync(
        string pythonCode,
        List<TestCase> testCases,
        CancellationToken ct = default);
}