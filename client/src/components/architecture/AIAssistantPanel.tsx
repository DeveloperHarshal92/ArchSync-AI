import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Send,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Lightbulb,
  ShieldAlert,
  Box,
  HelpCircle,
} from 'lucide-react';
import {
  AIAnalysisResponse,
  AIFindingSeverity,
  AIRiskSeverity,
  AIConfidenceLevel,
} from '@archsync/shared';
import {
  useAnalyzeArchitectureMutation,
  useChatArchitectureMutation,
} from '../../store/api/aiApi';

interface AIAssistantPanelProps {
  projectId: string;
  onClose: () => void;
  onSelectNode?: (nodeId: string) => void;
}

const QUICK_ACTIONS = [
  'Analyze scalability',
  'Analyze security',
  'Find single points of failure',
  'Review architecture',
  'Explain validation issues',
  'Suggest improvements',
  'Analyze reliability',
];

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  projectId,
  onClose,
  onSelectNode,
}) => {
  const [question, setQuestion] = useState('');
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [response, setResponse] = useState<AIAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [analyzeMutation, { isLoading: isAnalyzing }] = useAnalyzeArchitectureMutation();
  const [chatMutation, { isLoading: isChatting }] = useChatArchitectureMutation();

  const isLoading = isAnalyzing || isChatting;

  // Clear previous AI state if user switches project
  useEffect(() => {
    setResponse(null);
    setErrorMessage(null);
    setQuestion('');
    setLastPrompt(null);
  }, [projectId]);

  const handleAnalyze = useCallback(
    async (promptText?: string) => {
      setErrorMessage(null);
      const query = promptText || (question.trim().length > 0 ? question.trim() : undefined);
      setLastPrompt(query || 'Full Architecture Review');

      try {
        const result = await analyzeMutation({
          projectId,
          question: query,
        }).unwrap();

        if (result.success) {
          setResponse(result.data);
          setQuestion('');
        } else {
          setErrorMessage(result.error?.message || 'Unable to analyze architecture.');
        }
      } catch (err: any) {
        setErrorMessage(
          err?.data?.error?.message ||
            err?.message ||
            'The AI assistant is temporarily unavailable. Please try again.'
        );
      }
    },
    [analyzeMutation, projectId, question]
  );

  const handleChat = useCallback(
    async (questionText: string) => {
      if (!questionText.trim()) return;
      setErrorMessage(null);
      setLastPrompt(questionText);

      try {
        const result = await chatMutation({
          projectId,
          question: questionText.trim(),
        }).unwrap();

        if (result.success) {
          setResponse(result.data);
          setQuestion('');
        } else {
          setErrorMessage(result.error?.message || 'Unable to answer question.');
        }
      } catch (err: any) {
        setErrorMessage(
          err?.data?.error?.message ||
            err?.message ||
            'The AI assistant is temporarily unavailable. Please try again.'
        );
      }
    },
    [chatMutation, projectId]
  );

  const handleQuickAction = (actionPrompt: string) => {
    handleChat(actionPrompt);
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
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
            <AlertCircle className="h-3 w-3 shrink-0" />
            WARNING
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30">
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
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/15 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-500/30">
            LOW
          </span>
        );
    }
  };

  const renderConfidenceBadge = (confidence: AIConfidenceLevel) => {
    const colors = {
      HIGH: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      LOW: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    };
    return (
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border ${colors[confidence] || colors.MEDIUM}`}
      >
        {confidence} CONFIDENCE
      </span>
    );
  };

  return (
    <div
      data-testid="ai-assistant-panel"
      className="flex flex-col h-full bg-slate-900/95 text-slate-100 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              AI Architecture Assistant
            </h3>
            <p className="text-[11px] text-slate-400">Advisory Review & Questions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Assistant Panel"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Analyze Architecture CTA */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Comprehensive Review
            </span>
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading}
              data-testid="ai-analyze-btn"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing...' : 'Analyze Architecture'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Evaluates single points of failure, scalability, decoupling, and structural validation.
          </p>
        </div>

        {/* Quick Action Prompt Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Quick Actions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                data-testid={`ai-quick-${action.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300 disabled:opacity-50 transition-colors"
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
            className="flex flex-col items-center justify-center p-6 space-y-3 rounded-xl border border-cyan-500/20 bg-cyan-950/10 text-center"
          >
            <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <div>
              <p className="text-xs font-semibold text-cyan-300">
                Consulting Architecture Assistant...
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Grounding analysis on current diagram nodes and connections
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div
            data-testid="ai-error-banner"
            className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 space-y-2"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>Analysis Error</span>
            </div>
            <p className="text-[11px] text-rose-200/90">{errorMessage}</p>
            <button
              onClick={() => (lastPrompt ? handleAnalyze(lastPrompt) : handleAnalyze())}
              className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State (Initial) */}
        {!response && !isLoading && !errorMessage && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 rounded-xl border border-slate-800/60 bg-slate-900/40">
            <HelpCircle className="h-8 w-8 text-slate-500" />
            <p className="text-xs font-semibold text-slate-300">No Analysis Performed Yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Click &quot;Analyze Architecture&quot; or choose a quick action above to receive advisory
              insights on your system design.
            </p>
          </div>
        )}

        {/* AI Response Display */}
        {response && !isLoading && (
          <div data-testid="ai-response-container" className="space-y-4">
            {/* Summary */}
            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Executive Summary</span>
                {renderConfidenceBadge(response.confidence)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{response.summary}</p>
            </div>

            {/* Findings */}
            {response.findings && response.findings.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Key Findings ({response.findings.length})
                </span>
                <div className="space-y-2">
                  {response.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800/90 bg-slate-900/60 p-2.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {finding.title}
                        </span>
                        {renderSeverityBadge(finding.severity)}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {finding.explanation}
                      </p>
                      {finding.relatedNodeIds && finding.relatedNodeIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] text-slate-500">Related nodes:</span>
                          {finding.relatedNodeIds.map((nodeId) => (
                            <button
                              key={nodeId}
                              onClick={() => onSelectNode?.(nodeId)}
                              data-testid={`ai-focus-node-${nodeId}`}
                              className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700 transition-colors"
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
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Recommendations ({response.recommendations.length})
                </span>
                <div className="space-y-2">
                  {response.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-indigo-500/20 bg-indigo-950/10 p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-200">
                        <Lightbulb className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>{rec.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {rec.explanation}
                      </p>
                      {rec.tradeoff && (
                        <div className="rounded bg-slate-900/80 p-1.5 text-[10px] text-amber-300/90 border border-amber-500/20">
                          <span className="font-semibold text-amber-400">Tradeoff: </span>
                          {rec.tradeoff}
                        </div>
                      )}
                      {rec.relatedNodeIds && rec.relatedNodeIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] text-slate-500">Related nodes:</span>
                          {rec.relatedNodeIds.map((nodeId) => (
                            <button
                              key={nodeId}
                              onClick={() => onSelectNode?.(nodeId)}
                              className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-indigo-300 hover:bg-slate-700 hover:text-indigo-200 border border-slate-700 transition-colors"
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
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Identified Risks ({response.risks.length})
                </span>
                <div className="space-y-1.5">
                  {response.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-rose-400 shrink-0" />
                          {risk.title}
                        </span>
                        {renderRiskBadge(risk.severity)}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {risk.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assumptions */}
            {response.assumptions && response.assumptions.length > 0 && (
              <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Architectural Assumptions
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
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
      <div className="border-t border-slate-800/80 p-3 bg-slate-950/80 shrink-0">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about this architecture (e.g. scalability, cache, SPOF)..."
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50"
          />
          <button
            onClick={() => question.trim() && handleChat(question.trim())}
            disabled={isLoading || !question.trim()}
            data-testid="ai-send-btn"
            className="absolute right-2.5 bottom-3.5 rounded-lg p-1 text-cyan-400 hover:bg-slate-800 hover:text-cyan-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Send Question (Enter)"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
          <span>Advisory only • Press Enter to send</span>
          <span>F12</span>
        </p>
      </div>
    </div>
  );
};
