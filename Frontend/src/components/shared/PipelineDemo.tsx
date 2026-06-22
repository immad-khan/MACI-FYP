import { useState } from 'react';
import { runPipeline, PipelineResponse } from '../../services/api';

export default function PipelineDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunDemo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await runPipeline({
        title: 'Check Prime Number',
        description: 'Write a Python function called is_prime that takes an integer n and returns True if n is prime, False otherwise.',
        testCases: [
          { input: '7', expectedOutput: 'True' },
          { input: '4', expectedOutput: 'False' }
        ]
      });
      
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#080808] min-h-screen text-[#F5F5F5]">
      <h1 className="text-3xl font-bold mb-8">MACI Pipeline Demo</h1>
      
      <button
        onClick={handleRunDemo}
        disabled={loading}
        className="px-6 py-3 bg-[#E8E8E8] text-[#080808] rounded-lg font-semibold hover:bg-white transition-all disabled:opacity-50"
      >
        {loading ? 'Running Pipeline...' : 'Run Demo Pipeline'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-[#E05252] bg-opacity-10 border border-[#E05252] rounded-lg">
          <p className="text-[#E05252]">Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Master Agent */}
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#C0C0C0] mb-4">📋 Master Agent Output</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#8A8A8A]">Function:</span> {result.masterAgentOutput.functionSignature}</p>
              <p><span className="text-[#8A8A8A]">Summary:</span> {result.masterAgentOutput.problemSummary}</p>
              <div>
                <span className="text-[#8A8A8A]">Constraints:</span>
                <ul className="list-disc ml-6 mt-1">
                  {result.masterAgentOutput.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Writer Agent */}
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#C0C0C0] mb-4">✍️ Writer Agent Output</h2>
            <pre className="bg-[#080808] p-4 rounded border border-[#2E2E2E] overflow-x-auto text-sm">
              <code>{result.writerAgentOutput.generatedCode}</code>
            </pre>
          </div>

          {/* Verifier Agent */}
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#C0C0C0] mb-4">🔍 Verifier Agent Output</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  result.verifierAgentOutput.isClean 
                    ? 'bg-[#4CAF82] bg-opacity-20 text-[#4CAF82]' 
                    : 'bg-[#E05252] bg-opacity-20 text-[#E05252]'
                }`}>
                  {result.verifierAgentOutput.isClean ? '✅ CLEAN' : '⚠️ BUGS DETECTED'}
                </span>
                <span className="text-[#8A8A8A] text-sm">Execution Time: {result.verifierAgentOutput.executionTimeMs}ms</span>
              </div>

              {result.verifierAgentOutput.hasBugs && (
                <div className="bg-[#E05252] bg-opacity-10 border border-[#E05252] rounded p-4">
                  <p className="font-semibold text-[#E05252]">
                    {result.verifierAgentOutput.primaryBugType} → {result.verifierAgentOutput.secondaryBugType}
                  </p>
                  <p className="text-sm mt-2">{result.verifierAgentOutput.bugDescription}</p>
                  <p className="text-sm text-[#8A8A8A] mt-1">Location: {result.verifierAgentOutput.bugLocation}</p>
                </div>
              )}

              {result.verifierAgentOutput.stderr && (
                <div>
                  <p className="text-[#8A8A8A] text-sm mb-1">Standard Error:</p>
                  <pre className="bg-[#080808] p-3 rounded text-xs border border-[#2E2E2E] overflow-x-auto">
                    {result.verifierAgentOutput.stderr}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}