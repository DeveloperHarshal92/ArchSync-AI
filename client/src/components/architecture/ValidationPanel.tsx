import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  RefreshCw,
  Box,
  GitBranch,
} from 'lucide-react';
import { ArchitectureValidationResult, ValidationIssue, ValidationSeverity } from '@archsync/shared';

interface ValidationPanelProps {
  validationResult: ArchitectureValidationResult | null;
  isValidating: boolean;
  onValidate: () => void;
  onClose: () => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResult,
  isValidating,
  onValidate,
  onClose,
  onSelectNode,
  onSelectEdge,
}) => {
  const issues = validationResult?.issues || [];
  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
  const infoCount = issues.filter((i) => i.severity === 'INFO').length;

  const renderSeverityBadge = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            ERROR
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
            <AlertCircle className="h-3 w-3 shrink-0" />
            WARNING
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-400 border border-sky-500/30">
            <Info className="h-3 w-3 shrink-0" />
            INFO
          </span>
        );
    }
  };

  return (
    <div
      data-testid="validation-panel"
      className="flex flex-col h-full w-full bg-slate-950/95 border-l border-slate-800 text-slate-100 shadow-2xl backdrop-blur-md"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Architecture Validation</h3>
            <p className="text-[11px] text-slate-400">Rules engine structural integrity</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onValidate}
            disabled={isValidating}
            data-testid="run-validation-btn"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
            title="Re-run architecture validation"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isValidating ? 'animate-spin' : ''}`} />
            <span>{isValidating ? 'Validating...' : 'Validate'}</span>
          </button>

          <button
            onClick={onClose}
            data-testid="close-validation-panel-btn"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Close validation panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Summary Status Banner */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/30">
        {validationResult && validationResult.valid && issues.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-200">Architecture is Structurally Valid</h4>
              <p className="mt-0.5 text-[11px] text-emerald-300/80 leading-relaxed">
                No structural errors, disconnected nodes, or circular dependencies detected.
              </p>
            </div>
          </div>
        ) : validationResult && !validationResult.valid ? (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-300">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-200">Structural Errors Detected</h4>
              <p className="mt-0.5 text-[11px] text-rose-300/80 leading-relaxed">
                The architecture contains invalid graph configurations that must be resolved.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-200">Architecture Warnings Found</h4>
              <p className="mt-0.5 text-[11px] text-amber-300/80 leading-relaxed">
                The diagram is valid but has structural warnings that should be reviewed.
              </p>
            </div>
          </div>
        )}

        {/* Issue Counts Bar */}
        {issues.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
              </span>
            )}
            {infoCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-sky-400">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                {infoCount} Info
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/40 mb-2" />
            <p className="text-xs font-medium text-slate-400">No validation issues</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Every node and edge satisfies all structural rules in the architecture engine.
            </p>
          </div>
        ) : (
          issues.map((issue: ValidationIssue) => (
            <div
              key={issue.id}
              data-testid={`validation-issue-${issue.id}`}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                {renderSeverityBadge(issue.severity)}
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {issue.code}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {issue.message}
              </p>

              {/* Related Nodes Badges */}
              {issue.nodeIds && issue.nodeIds.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Nodes:</span>
                  {issue.nodeIds.map((nodeId) => (
                    <button
                      key={nodeId}
                      onClick={() => onSelectNode?.(nodeId)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/80 px-1.5 py-0.5 text-[11px] font-mono text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:border-cyan-500/40"
                      title={`Select node "${nodeId}" on canvas`}
                    >
                      <Box className="h-2.5 w-2.5" />
                      {nodeId}
                    </button>
                  ))}
                </div>
              )}

              {/* Related Edges Badges */}
              {issue.edgeIds && issue.edgeIds.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Edges:</span>
                  {issue.edgeIds.map((edgeId) => (
                    <button
                      key={edgeId}
                      onClick={() => onSelectEdge?.(edgeId)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/80 px-1.5 py-0.5 text-[11px] font-mono text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:border-cyan-500/40"
                      title={`Select edge "${edgeId}" on canvas`}
                    >
                      <GitBranch className="h-2.5 w-2.5" />
                      {edgeId}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 4. Footer timestamp */}
      {validationResult?.validatedAt && (
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-900/40 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Validated at:</span>
          <span className="font-mono text-slate-400">
            {new Date(validationResult.validatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};
