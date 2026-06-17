namespace MACI.Core.Enums;

public enum BugPrimaryType
{
    Syntax,
    Runtime,
    Functional
}

public enum BugSecondaryType
{
    MissingColon,
    IndentationError,
    UndefinedVariable,
    TypeMismatch,
    IndexOutOfBounds,
    NullReference,
    InfiniteLoop,
    WrongAlgorithm,
    WrongOutput,
    EdgeCaseFailure
}

public enum PipelineStatus
{
    Pending,
    Running,
    MasterAgentRunning,
    WriterAgentRunning,
    VerifierAgentRunning,
    OptimizerAgentRunning,
    Completed,
    Failed
}

public enum GenerationTechnique
{
    ChainOfThought,
    StructuredChainOfThought
}