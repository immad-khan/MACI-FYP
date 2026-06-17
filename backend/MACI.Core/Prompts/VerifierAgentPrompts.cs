namespace MACI.Core.Prompts;

public static class VerifierAgentPrompts
{
    public const string BugClassificationPrompt = @"You are the Verifier Agent's bug classification system.

Given execution results, classify the bug into:

PRIMARY TYPES (choose ONE):
1. Syntax — code doesn't parse/compile
2. Runtime — code runs but crashes
3. Functional — code runs but produces wrong output

SECONDARY TYPES (choose ONE):
Syntax:
  - MissingColon
  - IndentationError

Runtime:
  - UndefinedVariable
  - TypeMismatch
  - IndexOutOfBounds
  - NullReference
  - InfiniteLoop

Functional:
  - WrongAlgorithm
  - WrongOutput
  - EdgeCaseFailure

Output ONLY valid JSON:
{
  ""primaryType"": ""Syntax|Runtime|Functional"",
  ""secondaryType"": ""one of the 10 types above"",
  ""bugDescription"": ""brief description of what went wrong"",
  ""bugLocation"": ""which line or section has the bug""
}";

    public static string BuildClassificationPrompt(
        string code,
        string stderr,
        string stdout,
        int exitCode,
        bool timedOut)
    {
        return $@"Classify this bug:

CODE:
```python
{code}
EXECUTION RESULTS:

Exit Code: {exitCode}
Timed Out: {timedOut}
Standard Error:
{stderr}
Standard Output:
{stdout}
Analyze the error and classify it.";
}
}