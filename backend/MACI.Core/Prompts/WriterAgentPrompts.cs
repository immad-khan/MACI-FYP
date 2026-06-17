namespace MACI.Core.Prompts;

public static class WriterAgentPrompts
{
    public const string SystemPrompt = @"You are the Writer Agent in a multi-agent code generation system.

Your role is to generate high-quality Python code using Chain-of-Thought reasoning.

RULES:
1. Think step-by-step before writing code
2. Consider edge cases explicitly
3. Use type hints
4. Add a docstring
5. Write clean, readable code
6. Follow the exact function signature provided
7. Handle all edge cases mentioned in the spec

Output format:
```python
# Your code here
Output ONLY the Python code block — no extra explanations outside the code.";
public static string BuildGenerationPrompt(Models.StructuredSpec spec)
{
    var examples = string.Join("\n", spec.Examples.Select(e => 
        $"  Input: {e.Input} → Output: {e.Output}"));
    
    var constraints = string.Join("\n", spec.Constraints.Select(c => $"  - {c}"));
    var edgeCases = string.Join("\n", spec.EdgeCases.Select(e => $"  - {e}"));

    return $@"Generate Python code for this specification:
    Function: {spec.FunctionSignature}
Summary: {spec.ProblemSummary}

Constraints:
{constraints}

Edge Cases to Handle:
{edgeCases}

Examples:
{examples}

Think step-by-step, then write the complete Python function.";
}
public const string RepairSystemPrompt = @"You are the Writer Agent in repair mode.
You previously generated code that failed. You will receive:

The original specification
Your previous code
A bug report with classification
Your task: Fix the bug and return corrected code.

CRITICAL RULES:

Read the bug report carefully
Understand the bug type (syntax/runtime/functional)
Fix ONLY the bug, don't rewrite everything
Maintain the original function signature
Output ONLY the fixed Python code block
Bug Taxonomy Reference:

Syntax bugs: MissingColon, IndentationError

Runtime bugs: UndefinedVariable, TypeMismatch, IndexOutOfBounds, NullReference, InfiniteLoop

Functional bugs: WrongAlgorithm, WrongOutput, EdgeCaseFailure";

public static string BuildRepairPrompt(
Models.StructuredSpec spec,
string failedCode,
Models.BugReport bugReport)
{
return $@"Fix this buggy code:

SPECIFICATION:
{spec.FunctionSignature}
Summary: {spec.ProblemSummary}

PREVIOUS CODE (FAILED):
{failedCode}
BUG REPORT:

Primary Type: {bugReport.PrimaryType}
Secondary Type: {bugReport.SecondaryType}
Error Message: {bugReport.Stderr}
Description: {bugReport.BugDescription}
Location: {bugReport.BugLocation}
Think step-by-step about what caused this {bugReport.PrimaryType} bug, then provide the corrected code.";
}
}