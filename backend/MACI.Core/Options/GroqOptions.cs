namespace MACI.Core.Options;

public class GroqOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.groq.com/openai/v1";
    public string Model { get; set; } = "llama-3.3-70b-versatile";
    public double Temperature { get; set; } = 0.1;
    public int MaxTokens { get; set; } = 4096;
}

public class PipelineOptions
{
    public int MaxRepairIterations { get; set; } = 2;
    public int ExecutionTimeoutSeconds { get; set; } = 10;
    public string PythonExecutablePath { get; set; } = "python";
}