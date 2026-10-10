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
} from 'lucide-react';
import {
  AIAnalysisResponse,
  AIFindingSeverity,
  AIRiskSeverity,
  AIConfidenceLevel,
} from '@archsync/shared';
import { useAnalyzeArchitectureMutation } from '../../store/api/aiApi';

export interface AIAssistantPanelProps {
  projectId?: string;
  isLoading?: boolean;
  response?: AIAnalysisResponse | null;
  errorMessage?: string | null;
  onAnalyze?: (customPrompt?: string) => Promise<void>;
  onClose: () => void;
  onSelectNode?: (nodeId: string) => void;
}

const QUICK_ACTIONS = [
  'Evaluate Single Point of Failure (SPOF)',
  'Scalability & Bottleneck Review',
  'Decoupling & Async Opportunities',
  'Security & Isolation Boundaries',
];

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  projectId = '',
  isLoading: externalLoading,
  response: externalResponse,
  errorMessage: externalError,
  onAnalyze: externalAnalyze,
  onClose,
  onSelectNode,
}) => {
  const [internalAnalyze, { data: mutationData, isLoading: internalLoading, error: mutationError }] =
    useAnalyzeArchitectureMutation();
  const [internalErrorMsg, setInternalErrorMsg] = useState<string | null>(null);

  const isLoading = externalLoading ?? internalLoading;
  const response =
    externalResponse !== undefined
      ? externalResponse
      : mutationData && mutationData.success
      ? mutationData.data
      : null;
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
          <span className="inline-flex items-center gap-1 rounded-md bg-[#ef8557]/20 px-2 py-0.5 text-[10px] font-bold text-[#ef8557] border border-[#ef8557]/50 font-mono">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#ef8557]/10 px-2 py-0.5 text-[10px] font-bold text-[#ef8557] border border-[#ef8557]/30 font-mono">
            <AlertCircle className="h-3 w-3 shrink-0" />
            WARNING
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#eae6ed]/15 px-2 py-0.5 text-[10px] font-bold text-[#eae6ed] border border-[#eae6ed]/30 font-mono">
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
          <span className="inline-flex items-center gap-1 rounded-md bg-[#ef8557]/20 px-2 py-0.5 text-[10px] font-bold text-[#ef8557] border border-[#ef8557]/50 font-mono">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#ef8557]/10 px-2 py-0.5 text-[10px] font-bold text-[#ef8557] border border-[#ef8557]/30 font-mono">
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#eae6ed]/15 px-2 py-0.5 text-[10px] font-bold text-[#eae6ed] border border-[#eae6ed]/30 font-mono">
            LOW
          </span>
        );
    }
  };

  const renderConfidenceBadge = (confidence: AIConfidenceLevel) => {
    const colors = {
      HIGH: 'bg-[#226192]/10 text-[#226192] border-[#226192]/30',
      MEDIUM: 'bg-[#ef8557]/15 text-[#ef8557] border-[#ef8557]/30',
      LOW: 'bg-[#eae6ed] text-[#226192]/70 border-[#226192]/20',
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
      className="flex flex-col h-full bg-[#eae6ed] text-[#226192] overflow-hidden select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#226192]/15 bg-[#eae6ed] px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#226192]/10 text-[#ef8557] border border-[#ef8557]/40 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-medium text-[#226192] flex items-center gap-1.5">
              AI Architecture Assistant
            </h3>
            <p className="text-[11px] font-mono text-[#226192]/70">Advisory Review & Questions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Assistant Panel"
          className="rounded-md p-1 text-[#226192]/70 hover:bg-[#226192]/5 hover:text-[#226192] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Analyze Architecture CTA */}
        <div className="rounded-lg border border-[#226192]/15 bg-[#226192]/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#ef8557] flex items-center gap-1 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              Comprehensive Review
            </span>
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading}
              data-testid="ai-analyze-btn"
              className="flex items-center gap-1.5 rounded-md bg-[#226192] hover:bg-[#226192]/90 border border-[#226192]/30 px-3 py-1.5 text-xs font-medium text-[#eae6ed] shadow hover:text-[#eae6ed] disabled:opacity-50 transition-colors focus:ring-2 focus:ring-[#ef8557]"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing...' : 'Analyze Architecture'}</span>
            </button>
          </div>
          <p className="text-[11px] text-[#226192]/70">
            Evaluates single points of failure, scalability, decoupling, and structural validation.
          </p>
        </div>

        {/* Quick Action Prompt Chips */}
        <div>
          <span className="text-[11px] font-mono font-semibold text-[#226192]/70 uppercase tracking-wider block mb-1.5">
            Suggested Quick Actions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                data-testid={`ai-quick-${action.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-md border border-[#226192]/20 bg-[#eae6ed] px-2.5 py-1 text-[11px] font-medium text-[#226192] hover:border-[#ef8557] hover:text-[#ef8557] disabled:opacity-50 transition-colors"
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
            className="flex flex-col items-center justify-center p-6 space-y-3 rounded-lg border border-[#ef8557]/40 bg-[#eae6ed] text-center"
          >
            <div className="h-8 w-8 rounded-full border-2 border-[#ef8557] border-t-transparent animate-spin" />
            <div>
              <p className="text-xs font-semibold text-[#226192]">
                Consulting Architecture Assistant...
              </p>
              <p className="text-[11px] text-[#226192]/70 mt-0.5">
                Grounding analysis on current diagram nodes and connections
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div
            data-testid="ai-error-banner"
            className="rounded-lg border border-[#ef8557]/40 bg-[#ef8557]/15 p-3 space-y-2"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ef8557]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#ef8557]" />
              <span>Analysis Error</span>
            </div>
            <p className="text-[11px] text-[#226192]/90">{errorMessage}</p>
            <button
              onClick={() => (lastPrompt ? handleAnalyze(lastPrompt) : handleAnalyze())}
              className="inline-flex items-center gap-1 rounded bg-[#ef8557]/20 border border-[#ef8557]/30 px-2 py-1 text-[11px] font-semibold text-[#ef8557] hover:bg-[#ef8557]/30 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State (Initial) */}
        {!response && !isLoading && !errorMessage && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 rounded-lg border border-[#226192]/15 bg-[#226192]/[0.03]">
            <HelpCircle className="h-8 w-8 text-[#226192]/60" />
            <p className="text-xs font-semibold text-[#226192]">No Analysis Performed Yet</p>
            <p className="text-[11px] text-[#226192]/70 max-w-xs">
              Click &quot;Analyze Architecture&quot; or choose a quick action above to receive advisory
              insights on your system design.
            </p>
          </div>
        )}

        {/* AI Response Display */}
        {response && !isLoading && (
          <div data-testid="ai-response-container" className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg border border-[#226192]/15 bg-[#226192]/[0.03] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-semibold text-[#226192]">Executive Summary</span>
                {renderConfidenceBadge(response.confidence)}
              </div>
              <p className="text-xs text-[#226192] leading-relaxed">{response.summary}</p>
            </div>

            {/* Findings */}
            {response.findings && response.findings.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-[#226192]/70 uppercase tracking-wider block">
                  Key Findings ({response.findings.length})
                </span>
                <div className="space-y-2">
                  {response.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[#226192]/15 bg-[#226192]/[0.03] p-2.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-[#226192]">
                          {finding.title}
                        </span>
                        {renderSeverityBadge(finding.severity)}
                      </div>
                      <p className="text-[11px] text-[#226192]/70 leading-relaxed">
                        {finding.explanation}
                      </p>
                      {finding.relatedNodeIds && finding.relatedNodeIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] text-[#226192]/70 font-mono">Related nodes:</span>
                          {finding.relatedNodeIds.map((nodeId) => (
                            <button
                              key={nodeId}
                              onClick={() => onSelectNode?.(nodeId)}
                              data-testid={`ai-focus-node-${nodeId}`}
                              className="inline-flex items-center gap-1 rounded bg-[#eae6ed] px-1.5 py-0.5 text-[10px] font-mono text-[#ef8557] hover:border-[#ef8557] border border-[#226192]/20 transition-colors"
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

            {/* Recommendations */}
            {response.recommendations && response.recommendations.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-[#226192]/70 uppercase tracking-wider block">
                  Recommendations ({response.recommendations.length})
                </span>
                <div className="space-y-2">
                  {response.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[#226192]/15 bg-[#226192]/[0.03] p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#226192]">
                        <Lightbulb className="h-3.5 w-3.5 text-[#ef8557] shrink-0" />
                        <span>{rec.title}</span>
                      </div>
                      <p className="text-[11px] text-[#226192]/70 leading-relaxed">
                        {rec.explanation}
                      </p>
                      {rec.tradeoff && (
                        <div className="rounded bg-[#ef8557]/10 p-1.5 text-[10px] text-[#226192] border border-[#ef8557]/30">
                          <span className="font-semibold text-[#ef8557]">Tradeoff: </span>
                          {rec.tradeoff}
                        </div>
                      )}
                      {rec.relatedNodeIds && rec.relatedNodeIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] text-[#226192]/70 font-mono">Related nodes:</span>
                          {rec.relatedNodeIds.map((nodeId) => (
                            <button
                              key={nodeId}
                              onClick={() => onSelectNode?.(nodeId)}
                              className="inline-flex items-center gap-1 rounded bg-[#eae6ed] px-1.5 py-0.5 text-[10px] font-mono text-[#ef8557] hover:border-[#ef8557] border border-[#226192]/20 transition-colors"
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

            {/* Risks */}
            {response.risks && response.risks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-[#226192]/70 uppercase tracking-wider block">
                  Identified Risks ({response.risks.length})
                </span>
                <div className="space-y-1.5">
                  {response.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[#226192]/15 bg-[#226192]/[0.03] p-2 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[#226192] flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-[#ef8557] shrink-0" />
                          {risk.title}
                        </span>
                        {renderRiskBadge(risk.severity)}
                      </div>
                      <p className="text-[11px] text-[#226192]/70 leading-relaxed">
                        {risk.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assumptions */}
            {response.assumptions && response.assumptions.length > 0 && (
              <div className="rounded-lg border border-[#226192]/15 bg-[#226192]/[0.03] p-2.5 space-y-1">
                <span className="text-[10px] font-mono font-semibold text-[#226192]/70 uppercase tracking-wider block">
                  Architectural Assumptions
                </span>
                <ul className="list-disc list-inside text-[11px] text-[#226192]/70 space-y-0.5">
                  {response.assumptions.map((assumption, idx) => (
                    <li key={idx}>{assumption}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Question Input Box */}
      <div className="border-t border-[#226192]/15 p-3 bg-[#eae6ed] shrink-0">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about this architecture (e.g. scalability, cache, SPOF)..."
            rows={2}
            className="w-full resize-none rounded-md border border-[#226192]/20 bg-[#eae6ed] px-3 py-2 pr-10 text-xs text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] disabled:opacity-50"
          />
          <button
            onClick={() => question.trim() && handleChat(question.trim())}
            disabled={isLoading || !question.trim()}
            data-testid="ai-send-btn"
            className="absolute right-2.5 bottom-3.5 rounded-md p-1.5 text-[#ef8557] hover:bg-[#226192]/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Send Question (Enter)"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-[#226192]/70 mt-1.5 flex items-center justify-between font-mono">
          <span>Advisory only • Press Enter to send</span>
          <span>F12</span>
        </p>
      </div>
    </div>
  );
};
