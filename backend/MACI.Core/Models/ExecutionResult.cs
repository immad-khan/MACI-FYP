namespace MACI.Core.Models;

public class ExecutionResult
{
    public bool Success { get; set; }
    public string Stdout { get; set; } = string.Empty;
    public string Stderr { get; set; } = string.Empty;
    public int ExitCode { get; set; }
    public bool TimedOut { get; set; }
    public long ExecutionTimeMs { get; set; }

    public static ExecutionResult Timeout() => new()
    {
        Success = false,
        TimedOut = true,
        ExitCode = -1,
        Stderr = "Execution timed out after 10 seconds"
    };
}