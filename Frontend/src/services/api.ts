const API_BASE_URL = 'http://localhost:5000/api';

export interface PipelineRequest {
  title: string;
  description: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

export interface PipelineResponse {
  pipelineId: string;
  durationMs: number;
  masterAgentOutput: {
    functionName: string;
    functionSignature: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    problemSummary: string;
    constraints: string[];
    edgeCases: string[];
    examples: Array<{
      input: string;
      output: string;
    }>;
  };
  writerAgentOutput: {
    generatedCode: string;
    technique: string;
    cotTrace?: string;
  };
  verifierAgentOutput: {
    hasBugs: boolean;
    isClean: boolean;
    executionPassed: boolean;
    primaryBugType?: string;
    secondaryBugType?: string;
    bugDescription?: string;
    bugLocation?: string;
    stdout?: string;
    stderr?: string;
    exitCode: number;
    timedOut: boolean;
    executionTimeMs: number;
    staticAnalysisFindings: Array<{
      tool: string;
      ruleId: string;
      message: string;
      severity: string;
      line?: number;
    }>;
  };
}

export async function runPipeline(request: PipelineRequest): Promise<PipelineResponse> {
  const response = await fetch(`${API_BASE_URL}/Test/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Pipeline failed');
  }

  return response.json();
}