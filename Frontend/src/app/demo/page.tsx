'use client';

import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

interface PipelineResponse {
    pipelineId: string;
    durationMs: number;
    masterAgentOutput: {
        functionName: string;
        functionSignature: string;
        parameters: Array<{ name: string; type: string; description: string }>;
        problemSummary: string;
        constraints: string[];
        edgeCases: string[];
        examples: Array<{ input: string; output: string }>;
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

export default function DemoPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PipelineResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeAgent, setActiveAgent] = useState<string | null>(null);

    const handleRunDemo = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Show agents activating one by one
            setActiveAgent('master');
            await new Promise(r => setTimeout(r, 500));
            setActiveAgent('writer');
            await new Promise(r => setTimeout(r, 500));
            setActiveAgent('verifier');

            const response = await fetch(`${API_BASE_URL}/Test/pipeline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Check Prime Number',
                    description: 'Write a Python function called is_prime that takes an integer n and returns True if n is prime, False otherwise. Handle edge cases: n less than 2 returns False.',
                    testCases: [
                        { input: '7', expectedOutput: 'True' },
                        { input: '4', expectedOutput: 'False' },
                        { input: '1', expectedOutput: 'False' }
                    ]
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Pipeline failed');
            }

            const data = await response.json();
            setResult(data);
            setActiveAgent(null);

        } catch (err: any) {
            setError(err.message);
            setActiveAgent(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#080808',
            color: '#F5F5F5',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#F5F5F5',
                        marginBottom: '0.5rem'
                    }}>
                        MACI Pipeline Demo
                    </h1>
                    <p style={{ color: '#606060', fontSize: '0.95rem' }}>
                        Multi-Agent Collaborative Infrastructure — Live Agent Demonstration
                    </p>
                    <div style={{
                        marginTop: '0.75rem',
                        height: '1px',
                        backgroundColor: '#1E1E1E'
                    }} />
                </div>

                {/* Agent Status Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        { key: 'master', label: 'Master Agent', icon: '👑', desc: 'Decomposes Problem' },
                        { key: 'writer', label: 'Writer Agent', icon: '✍️', desc: 'Generates Code' },
                        { key: 'verifier', label: 'Verifier Agent', icon: '🔍', desc: 'Detects Bugs' },
                    ].map(agent => (
                        <div key={agent.key} style={{
                            backgroundColor: '#0F0F0F',
                            border: `1px solid ${activeAgent === agent.key ? '#5A5A5A' : (result ? '#2E2E2E' : '#1E1E1E')}`,
                            borderRadius: '10px',
                            padding: '1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: activeAgent === agent.key ? '0 0 20px rgba(255,255,255,0.05)' : 'none'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{agent.icon}</div>
                            <p style={{
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                color: activeAgent === agent.key ? '#F5F5F5' : '#8A8A8A'
                            }}>
                                {agent.label}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#555' }}>{agent.desc}</p>
                            <div style={{ marginTop: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    backgroundColor: activeAgent === agent.key
                                        ? 'rgba(192,192,192,0.1)'
                                        : result ? 'rgba(76,175,130,0.1)' : 'rgba(60,60,60,0.3)',
                                    color: activeAgent === agent.key
                                        ? '#C0C0C0'
                                        : result ? '#4CAF82' : '#444'
                                }}>
                                    {activeAgent === agent.key ? '⚡ Running...' : result ? '✓ Done' : '○ Idle'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Run Button */}
                <button
                    onClick={handleRunDemo}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.9rem',
                        backgroundColor: loading ? '#1A1A1A' : '#E8E8E8',
                        color: loading ? '#555' : '#080808',
                        border: loading ? '1px solid #2E2E2E' : 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginBottom: '2rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loading ? '⏳ Pipeline Running — Agents Working...' : '🚀 Run MACI Pipeline'}
                </button>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(224,82,82,0.08)',
                        border: '1px solid #E05252',
                        borderRadius: '10px',
                        color: '#E05252',
                        marginBottom: '2rem',
                        fontSize: '0.9rem'
                    }}>
                        ❌ <strong>Error:</strong> {error}
                        <br />
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>
                            Make sure backend is running at http://localhost:5000
                        </span>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* ===== MASTER AGENT OUTPUT ===== */}
                        <div style={{
                            backgroundColor: '#0F0F0F',
                            border: '1px solid #2E2E2E',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid #1E1E1E',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>👑</span>
                                <div>
                                    <h2 style={{ fontWeight: '700', fontSize: '1rem', color: '#F5F5F5' }}>
                                        Master Agent Output
                                    </h2>
                                    <p style={{ fontSize: '0.75rem', color: '#555' }}>
                                        Problem decomposition & structured specification
                                    </p>
                                </div>
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '0.75rem',
                                    color: '#4CAF82',
                                    backgroundColor: 'rgba(76,175,130,0.1)',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px'
                                }}>
                                    ✓ Completed
                                </span>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Function Signature
                                    </p>
                                    <code style={{
                                        display: 'block',
                                        backgroundColor: '#080808',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '6px',
                                        border: '1px solid #1E1E1E',
                                        color: '#C0C0C0',
                                        fontSize: '0.9rem'
                                    }}>
                                        {result.masterAgentOutput.functionSignature}
                                    </code>
                                </div>

                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Problem Summary
                                    </p>
                                    <p style={{ color: '#9A9A9A', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                        {result.masterAgentOutput.problemSummary}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Constraints
                                        </p>
                                        {result.masterAgentOutput.constraints.map((c, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.5rem',
                                                marginBottom: '0.3rem',
                                                fontSize: '0.85rem',
                                                color: '#8A8A8A'
                                            }}>
                                                <span style={{ color: '#3A3A3A', marginTop: '2px' }}>—</span>
                                                {c}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Edge Cases
                                        </p>
                                        {result.masterAgentOutput.edgeCases.map((e, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.5rem',
                                                marginBottom: '0.3rem',
                                                fontSize: '0.85rem',
                                                color: '#8A8A8A'
                                            }}>
                                                <span style={{ color: '#3A3A3A', marginTop: '2px' }}>—</span>
                                                {e}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===== WRITER AGENT OUTPUT ===== */}
                        <div style={{
                            backgroundColor: '#0F0F0F',
                            border: '1px solid #2E2E2E',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid #1E1E1E',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>✍️</span>
                                <div>
                                    <h2 style={{ fontWeight: '700', fontSize: '1rem', color: '#F5F5F5' }}>
                                        Writer Agent Output
                                    </h2>
                                    <p style={{ fontSize: '0.75rem', color: '#555' }}>
                                        Generated using {result.writerAgentOutput.technique}
                                    </p>
                                </div>
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '0.75rem',
                                    color: '#4CAF82',
                                    backgroundColor: 'rgba(76,175,130,0.1)',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px'
                                }}>
                                    ✓ Completed
                                </span>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Generated Python Code
                                </p>
                                <pre style={{
                                    backgroundColor: '#080808',
                                    padding: '1.25rem',
                                    borderRadius: '8px',
                                    border: '1px solid #1E1E1E',
                                    overflowX: 'auto',
                                    fontSize: '0.875rem',
                                    color: '#E0E0E0',
                                    lineHeight: '1.7',
                                    margin: 0
                                }}>
                                    <code>{result.writerAgentOutput.generatedCode}</code>
                                </pre>
                            </div>
                        </div>

                        {/* ===== VERIFIER AGENT OUTPUT ===== */}
                        <div style={{
                            backgroundColor: '#0F0F0F',
                            border: `1px solid ${result.verifierAgentOutput.isClean ? '#2E2E2E' : '#E05252'}`,
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderBottom: `1px solid ${result.verifierAgentOutput.isClean ? '#1E1E1E' : 'rgba(224,82,82,0.2)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>🔍</span>
                                <div>
                                    <h2 style={{ fontWeight: '700', fontSize: '1rem', color: '#F5F5F5' }}>
                                        Verifier Agent Output
                                    </h2>
                                    <p style={{ fontSize: '0.75rem', color: '#555' }}>
                                        Bug detection using 3-primary / 10-secondary taxonomy
                                    </p>
                                </div>
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px',
                                    backgroundColor: result.verifierAgentOutput.isClean
                                        ? 'rgba(76,175,130,0.1)'
                                        : 'rgba(224,82,82,0.1)',
                                    color: result.verifierAgentOutput.isClean ? '#4CAF82' : '#E05252'
                                }}>
                                    {result.verifierAgentOutput.isClean ? '✓ No Bugs Found' : '⚠ Bugs Detected'}
                                </span>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                {/* Execution Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '1rem'
                                }}>
                                    {[
                                        { label: 'Exit Code', value: result.verifierAgentOutput.exitCode.toString() },
                                        { label: 'Execution Time', value: `${result.verifierAgentOutput.executionTimeMs}ms` },
                                        { label: 'Timed Out', value: result.verifierAgentOutput.timedOut ? 'Yes' : 'No' }
                                    ].map((stat, i) => (
                                        <div key={i} style={{
                                            backgroundColor: '#080808',
                                            border: '1px solid #1E1E1E',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem'
                                        }}>
                                            <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                                                {stat.label}
                                            </p>
                                            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#C0C0C0' }}>
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Bug Classification */}
                                {result.verifierAgentOutput.hasBugs && (
                                    <div style={{
                                        backgroundColor: 'rgba(224,82,82,0.05)',
                                        border: '1px solid rgba(224,82,82,0.3)',
                                        borderRadius: '8px',
                                        padding: '1rem'
                                    }}>
                                        <p style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                            Bug Classification (Dou et al. Taxonomy)
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                padding: '0.3rem 0.75rem',
                                                backgroundColor: 'rgba(224,82,82,0.15)',
                                                border: '1px solid #E05252',
                                                borderRadius: '6px',
                                                color: '#E05252',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                Primary: {result.verifierAgentOutput.primaryBugType}
                                            </span>
                                            <span style={{
                                                padding: '0.3rem 0.75rem',
                                                backgroundColor: 'rgba(196,154,60,0.15)',
                                                border: '1px solid #C49A3C',
                                                borderRadius: '6px',
                                                color: '#C49A3C',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                Secondary: {result.verifierAgentOutput.secondaryBugType}
                                            </span>
                                        </div>
                                        {result.verifierAgentOutput.bugDescription && (
                                            <p style={{ color: '#9A9A9A', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                                {result.verifierAgentOutput.bugDescription}
                                            </p>
                                        )}
                                        {result.verifierAgentOutput.bugLocation && (
                                            <p style={{ color: '#555', fontSize: '0.8rem' }}>
                                                📍 {result.verifierAgentOutput.bugLocation}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Stderr */}
                                {result.verifierAgentOutput.stderr && (
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                            Standard Error
                                        </p>
                                        <pre style={{
                                            backgroundColor: '#080808',
                                            border: '1px solid #1E1E1E',
                                            borderRadius: '6px',
                                            padding: '0.75rem',
                                            fontSize: '0.8rem',
                                            color: '#E05252',
                                            overflowX: 'auto',
                                            margin: 0
                                        }}>
                                            {result.verifierAgentOutput.stderr}
                                        </pre>
                                    </div>
                                )}

                                {/* Stdout */}
                                {result.verifierAgentOutput.stdout && (
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                            Standard Output
                                        </p>
                                        <pre style={{
                                            backgroundColor: '#080808',
                                            border: '1px solid #1E1E1E',
                                            borderRadius: '6px',
                                            padding: '0.75rem',
                                            fontSize: '0.8rem',
                                            color: '#4CAF82',
                                            overflowX: 'auto',
                                            margin: 0
                                        }}>
                                            {result.verifierAgentOutput.stdout}
                                        </pre>
                                    </div>
                                )}

                                {/* Static Analysis */}
                                {result.verifierAgentOutput.staticAnalysisFindings.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                            Static Analysis Findings
                                        </p>
                                        {result.verifierAgentOutput.staticAnalysisFindings.map((f, i) => (
                                            <div key={i} style={{
                                                backgroundColor: 'rgba(196,154,60,0.05)',
                                                border: '1px solid rgba(196,154,60,0.3)',
                                                borderRadius: '6px',
                                                padding: '0.75rem',
                                                marginBottom: '0.5rem',
                                                fontSize: '0.85rem'
                                            }}>
                                                <p style={{ color: '#C49A3C', fontWeight: '600', marginBottom: '0.25rem' }}>
                                                    [{f.severity}] {f.ruleId}
                                                </p>
                                                <p style={{ color: '#9A9A9A' }}>{f.message}</p>
                                                {f.line && (
                                                    <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                        Line {f.line}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Clean Message */}
                                {result.verifierAgentOutput.isClean && (
                                    <div style={{
                                        backgroundColor: 'rgba(76,175,130,0.05)',
                                        border: '1px solid rgba(76,175,130,0.3)',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ color: '#4CAF82', fontWeight: '600' }}>
                                            ✅ Code passed all verification checks
                                        </p>
                                        <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                            No syntax, runtime, or functional bugs detected
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pipeline Summary */}
                        <div style={{
                            backgroundColor: '#0A0A0A',
                            border: '1px solid #1A1A1A',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: '#3A3A3A'
                        }}>
                            <span>Pipeline ID: {result.pipelineId}</span>
                            <span>Total Duration: {result.durationMs}ms</span>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}