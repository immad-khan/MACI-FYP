namespace MACI.Core.Services.Interfaces;

public interface IGroqService
{
    Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken ct = default);
}