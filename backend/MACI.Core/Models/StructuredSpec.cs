namespace MACI.Core.Models;

public class StructuredSpec
{
    public string FunctionName { get; set; } = string.Empty;
    public string FunctionSignature { get; set; } = string.Empty;
    public List<ParameterSpec> Parameters { get; set; } = new();
    public string ReturnType { get; set; } = string.Empty;
    public string ProblemSummary { get; set; } = string.Empty;
    public List<string> Constraints { get; set; } = new();
    public List<string> EdgeCases { get; set; } = new();
    public List<ExampleCase> Examples { get; set; } = new();
}

public class ParameterSpec
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ExampleCase
{
    public string Input { get; set; } = string.Empty;
    public string Output { get; set; } = string.Empty;
}