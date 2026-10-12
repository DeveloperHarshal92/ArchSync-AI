import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Send,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  ShieldAlert,
  HelpCircle,
  X,
  Box,
  Link2,
} from 'lucide-react';
import {
  AIAnalysisResponse,
  AIFindingSeverity,
  AIRiskSeverity,
  AIConfidenceLevel,
} from '@archsync/shared';
import { useAnalyzeArchitectureMutation } from '../../store/api/aiApi';
import { SafeMarkdown } from '../ai/SafeMarkdown';

export interface AIAssistantPanelProps {
  projectId?: string;
  isLoading?: boolean;
  response?: AIAnalysisResponse | null;
  errorMessage?: string | null;
  onAnalyze?: (customPrompt?: string) => Promise<void>;
  onClose: () => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
}

const QUICK_ACTIONS = [
  'Evaluate Single Point of Failure (SPOF)',
  'Scalability & Bottleneck Review',
  'Decoupling & Async Opportunities',
  'Security & Isolation Boundaries',
];

/**
 * Gracefully normalizes structured or semi-structured AI response data,
 * preventing crashes or raw JSON dumps when the model returns markdown or partial fields.
 */
export function normalizeAIResponse(data: unknown): AIAnalysisResponse | null {
  if (!data) return null;
  if (typeof data === 'string') {
    return {
      summary: data,
      findings: [],
      recommendations: [],
      risks: [],
      assumptions: [],
      confidence: 'MEDIUM',
      analyzedAt: new Date().toISOString(),
    };
  }
  if (typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const summary =
      typeof d.summary === 'string'
        ? d.summary
        : typeof d.message === 'string'
        ? d.message
        : '';
    const findings = Array.isArray(d.findings) ? d.findings : [];
    const recommendations = Array.isArray(d.recommendations) ? d.recommendations : [];
    const risks = Array.isArray(d.risks) ? d.risks : [];
    const assumptions = Array.isArray(d.assumptions) ? d.assumptions.map(String) : [];
    const confidence = (['LOW', 'MEDIUM', 'HIGH'].includes(String(d.confidence))
      ? d.confidence
      : 'MEDIUM') as AIConfidenceLevel;
    const analyzedAt =
      typeof d.analyzedAt === 'string' ? d.analyzedAt : new Date().toISOString();

    return {
      summary: summary || 'Architecture analysis received.',
      findings,
      recommendations,
      risks,
      assumptions,
      confidence,
      analyzedAt,
    };
  }
  return null;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  projectId = '',
  isLoading: externalLoading,
  response: externalResponse,
  errorMessage: externalError,
  onAnalyze: externalAnalyze,
  onClose,
  onSelectNode,
  onSelectEdge,
}) => {
  const [internalAnalyze, { data: mutationData, isLoading: internalLoading, error: mutationError }] =
    useAnalyzeArchitectureMutation();
  const [internalErrorMsg, setInternalErrorMsg] = useState<string | null>(null);

  const isLoading = externalLoading ?? internalLoading;
  const rawResponse =
    externalResponse !== undefined
      ? externalResponse
      : mutationData && mutationData.success
      ? mutationData.data
      : null;
  const response = normalizeAIResponse(rawResponse);

  const errorMessage =
    externalError ??
    internalErrorMsg ??
    (mutationError && 'data' in mutationError
      ? (mutationError as { data?: { error?: { message?: string } } }).data?.error?.message ?? 'Analysis failed'
      : null);

  const [question, setQuestion] = useState('');
  const [lastPrompt, setLastPrompt] = useState<string | undefined>(undefined);

  const performAnalyze = async (customPrompt?: string) => {
    setLastPrompt(customPrompt);
    if (externalAnalyze) {
      await externalAnalyze(customPrompt);
    } else if (projectId) {
      setInternalErrorMsg(null);
      try {
        await internalAnalyze({ projectId, question: customPrompt }).unwrap();
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'data' in err &&
          typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
        ) {
          setInternalErrorMsg((err as { data: { error: { message: string } } }).data.error.message);
        } else {
          setInternalErrorMsg('AI analysis failed. Please try again.');
        }
      }
    }
  };

  const handleQuickAction = async (action: string) => {
    await performAnalyze(action);
  };

  const handleAnalyze = async (customPrompt?: string) => {
    await performAnalyze(customPrompt);
  };

  const handleChat = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;
    setQuestion('');
    await performAnalyze(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim()) {
        handleChat(question.trim());
      }
    }
  };

  const renderSeverityBadge = (severity: AIFindingSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-950/40 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40 font-mono">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#B99D73]/20 px-2 py-0.5 text-[10px] font-bold text-[#D6B887] border border-[#B99D73]/40 font-mono">
            <AlertCircle className="h-3 w-3 shrink-0" />
            WARNING
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30 font-mono">
            <Info className="h-3 w-3 shrink-0" />
            INFO
          </span>
        );
    }
  };

  const renderRiskBadge = (severity: AIRiskSeverity) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-950/40 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40 font-mono">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#B99D73]/20 px-2 py-0.5 text-[10px] font-bold text-[#D6B887] border border-[#B99D73]/40 font-mono">
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#B99D73]/10 px-2 py-0.5 text-[10px] font-bold text-[#B9B1A5] border border-[#B99D73]/25 font-mono">
            LOW
          </span>
        );
    }
  };

  const renderConfidenceBadge = (confidence: AIConfidenceLevel) => {
    const colors = {
      HIGH: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
      MEDIUM: 'bg-[#B99D73]/20 text-[#D6B887] border-[#B99D73]/40',
      LOW: 'bg-[#141310] text-[#B9B1A5] border-[#B99D73]/20',
    };
    return (
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border font-mono ${colors[confidence] || colors.MEDIUM}`}
      >
        {confidence} CONFIDENCE
      </span>
    );
  };

  return (
    <div
      data-testid="ai-assistant-panel"
      className="flex flex-col h-full bg-[var(--color-surface)] text-[var(--color-text)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/40 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-medium text-[var(--color-text)] flex items-center gap-1.5">
              AI Architecture Assistant
            </h3>
            <p className="text-[11px] font-mono text-[var(--color-text-muted)]">Advisory Review & Questions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Assistant Panel"
          className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Advisory Guarantee Banner */}
        <div className="flex items-start gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2 text-[11px] text-[var(--color-text-muted)]">
          <Info className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0 mt-0.5" />
          <span>
            Advisory-only analysis grounded in your diagram. The AI assistant does not modify your architecture graph.
          </span>
        </div>

        {/* Analyze Architecture CTA */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              Comprehensive Review
            </span>
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading}
              data-testid="ai-analyze-btn"
              className="flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] hover:brightness-105 text-white dark:text-[#090907] px-3 py-1.5 text-xs font-semibold shadow disabled:opacity-50 transition-colors focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing...' : 'Analyze Architecture'}</span>
            </button>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Evaluates single points of failure, scalability, decoupling, and structural validation.
          </p>
        </div>

        {/* Quick Action Prompt Chips */}
        <div>
          <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">
            Suggested Quick Actions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                data-testid={`ai-quick-${action.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            data-testid="ai-loading-indicator"
            className="flex flex-col items-center justify-center p-6 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-center"
          >
            <div className="h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
            <div>
              <p className="text-xs font-semibold text-[var(--color-text)]">
                Consulting Architecture Assistant...
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Grounding analysis on current diagram nodes and connections
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div
            data-testid="ai-error-banner"
            className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 space-y-2"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>Analysis Error</span>
            </div>
            <p className="text-[11px] text-[var(--color-text)]">{errorMessage}</p>
            <button
              onClick={() => (lastPrompt ? handleAnalyze(lastPrompt) : handleAnalyze())}
              className="inline-flex items-center gap-1 rounded bg-red-500/20 border border-red-500/30 px-2 py-1 text-[11px] font-semibold text-red-600 dark:text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State (Initial) */}
        {!response && !isLoading && !errorMessage && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]/50">
            <HelpCircle className="h-8 w-8 text-[var(--color-text-muted)]/60" />
            <p className="text-xs font-semibold text-[var(--color-text)]">No Analysis Performed Yet</p>
            <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs">
              Click &quot;Analyze Architecture&quot; or choose a quick action above to receive advisory
              insights on your system design.
            </p>
          </div>
        )}

        {/* AI Response Display */}
        {response && !isLoading && (
          <div data-testid="ai-response-container" className="space-y-4">
            {/* Executive Summary */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-semibold text-[var(--color-accent)]">Executive Summary</span>
                {renderConfidenceBadge(response.confidence)}
              </div>
              <SafeMarkdown content={response.summary} />
            </div>

            {/* Findings */}
            {response.findings && response.findings.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Key Findings ({response.findings.length})
                </span>
                <div className="space-y-2">
                  {response.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-[var(--color-text)]">
                          {finding.title}
                        </span>
                        {renderSeverityBadge(finding.severity)}
                      </div>
                      <SafeMarkdown content={finding.explanation} />
                      {finding.relatedNodeIds && finding.relatedNodeIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Related nodes:</span>
                          {finding.relatedNodeIds.map((nodeId) => (
                            <button
                              key={nodeId}
                              onClick={() => onSelectNode?.(nodeId)}
                              data-testid={`ai-focus-node-${nodeId}`}
                              className="inline-flex items-center gap-1 rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-accent)] hover:border-[var(--color-accent)] border border-[var(--color-border)] transition-colors"
                              title={`Focus node ${nodeId}`}
                            >
                              <Box className="h-2.5 w-2.5" />
                              <span>{nodeId}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {finding.relatedEdgeIds && finding.relatedEdgeIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Related connections:</span>
                          {finding.relatedEdgeIds.map((edgeId) => (
                            <button
                              key={edgeId}
                              onClick={() => onSelectEdge?.(edgeId)}
                              data-testid={`ai-focus-edge-${edgeId}`}
                              className="inline-flex items-center gap-1 rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text)] hover:border-[var(--color-accent)] border border-[var(--color-border)] transition-colors"
                              title={`Focus connection ${edgeId}`}
                            >
                              <Link2 className="h-2.5 w-2.5 text-[var(--color-accent)]" />
                              <span>{edgeId}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {response.recommendations && response.recommendations.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Recommendations ({response.recommendations.length})
                </span>
                <div className="space-y-2">
                  {response.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text)]">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)] font-mono text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <Lightbulb className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" />
                        <span>{rec.title}</span>
                      </div>
                      <SafeMarkdown content={rec.explanation} />
                      {rec.tradeoff && (
                        <div className="rounded bg-[var(--color-accent)]/10 p-2 text-[11px] text-[var(--color-text)] border border-[var(--color-accent)]/30">
                          <span className="font-semibold text-[var(--color-accent)] block mb-0.5">Tradeoff: </span>
                          <SafeMarkdown content={rec.tradeoff} />
                        </div>
                      )}
                      {rec.relatedNodeIds && rec.relatedNodeIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Related nodes:</span>
                          {rec.relatedNodeIds.map((nodeId) => (
                            <button
                              key={nodeId}
                              onClick={() => onSelectNode?.(nodeId)}
                              className="inline-flex items-center gap-1 rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-accent)] hover:border-[var(--color-accent)] border border-[var(--color-border)] transition-colors"
                              title={`Focus node ${nodeId}`}
                            >
                              <Box className="h-2.5 w-2.5" />
                              <span>{nodeId}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Identified Risks */}
            {response.risks && response.risks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Identified Risks ({response.risks.length})
                </span>
                <div className="space-y-1.5">
                  {response.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[var(--color-text)] flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-[var(--color-accent)] shrink-0" />
                          {risk.title}
                        </span>
                        {renderRiskBadge(risk.severity)}
                      </div>
                      <SafeMarkdown content={risk.explanation} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architectural Assumptions */}
            {response.assumptions && response.assumptions.length > 0 && (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2.5 space-y-1">
                <span className="text-[10px] font-mono font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Architectural Assumptions
                </span>
                <ul className="list-disc list-inside text-[11px] text-[var(--color-text-muted)] space-y-0.5">
                  {response.assumptions.map((assumption, idx) => (
                    <li key={idx}>
                      <span className="inline">
                        <SafeMarkdown content={assumption} className="inline" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Question Input Box */}
      <div className="border-t border-[var(--color-border)] p-3 bg-[var(--color-surface)] shrink-0">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about this architecture (e.g. scalability, cache, SPOF)..."
            rows={2}
            className="w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 pr-10 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50"
          />
          <button
            onClick={() => question.trim() && handleChat(question.trim())}
            disabled={isLoading || !question.trim()}
            data-testid="ai-send-btn"
            className="absolute right-2.5 bottom-3.5 rounded-md p-1.5 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Send Question (Enter)"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 flex items-center justify-between font-mono">
          <span>Advisory only • Press Enter to send</span>
          <span>F12</span>
        </p>
      </div>
    </div>
  );
};
