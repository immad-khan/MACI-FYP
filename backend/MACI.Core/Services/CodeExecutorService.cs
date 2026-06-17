using System.Diagnostics;
using System.Text;
using MACI.Core.Models;
using MACI.Core.Options;
using MACI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MACI.Core.Services;

public class CodeExecutorService : ICodeExecutorService
{
    private readonly PipelineOptions _options;
    private readonly ILogger<CodeExecutorService> _logger;

    public CodeExecutorService(
        IOptions<PipelineOptions> options,
        ILogger<CodeExecutorService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<ExecutionResult> ExecuteAsync(
        string pythonCode,
        string? testInput = null,
        CancellationToken ct = default)
    {
        var tempFile = Path.GetTempFileName() + ".py";
        
        try
        {
            await File.WriteAllTextAsync(tempFile, pythonCode, ct);

            var startInfo = new ProcessStartInfo
            {
                FileName = _options.PythonExecutablePath,
                Arguments = tempFile,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                RedirectStandardInput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            var stopwatch = Stopwatch.StartNew();
            using var process = new Process { StartInfo = startInfo };
            
            var outputBuilder = new StringBuilder();
            var errorBuilder = new StringBuilder();

            process.OutputDataReceived += (_, e) => { if (e.Data != null) outputBuilder.AppendLine(e.Data); };
            process.ErrorDataReceived += (_, e) => { if (e.Data != null) errorBuilder.AppendLine(e.Data); };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            if (!string.IsNullOrEmpty(testInput))
            {
                await process.StandardInput.WriteLineAsync(testInput);
                process.StandardInput.Close();
            }

            var timeoutMs = _options.ExecutionTimeoutSeconds * 1000;
            var completed = await process.WaitForExitAsync(TimeSpan.FromMilliseconds(timeoutMs), ct);
            
            stopwatch.Stop();

            if (!completed)
            {
                process.Kill(true);
                _logger.LogWarning("Python execution timed out after {Timeout}s", _options.ExecutionTimeoutSeconds);
                return ExecutionResult.Timeout();
            }

            return new ExecutionResult
            {
                Success = process.ExitCode == 0,
                Stdout = outputBuilder.ToString(),
                Stderr = errorBuilder.ToString(),
                ExitCode = process.ExitCode,
                TimedOut = false,
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing Python code");
            return new ExecutionResult
            {
                Success = false,
                Stderr = ex.Message,
                ExitCode = -1
            };
        }
        finally
        {
            if (File.Exists(tempFile))
                File.Delete(tempFile);
        }
    }

    public async Task<ExecutionResult> ExecuteWithTestCasesAsync(
        string pythonCode,
        List<TestCase> testCases,
        CancellationToken ct = default)
    {
        foreach (var testCase in testCases)
        {
            var result = await ExecuteAsync(pythonCode, testCase.Input, ct);
            
            if (!result.Success || result.TimedOut)
                return result;

            var actualOutput = result.Stdout.Trim();
            var expectedOutput = testCase.ExpectedOutput.Trim();

            if (actualOutput != expectedOutput)
            {
                result.Success = false;
                result.Stderr = $"Expected: {expectedOutput}\nActual: {actualOutput}";
                return result;
            }
        }

        return new ExecutionResult { Success = true };
    }
}

// Extension method for timeout
public static class ProcessExtensions
{
    public static async Task<bool> WaitForExitAsync(
        this Process process,
        TimeSpan timeout,
        CancellationToken ct = default)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(timeout);
        
        try
        {
            await process.WaitForExitAsync(cts.Token);
            return true;
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }
}