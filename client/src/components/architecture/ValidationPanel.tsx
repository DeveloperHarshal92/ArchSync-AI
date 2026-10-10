import React from 'react';
import {
  ArchitectureValidationResult,
  ValidationIssue,
  ValidationSeverity,
} from '@archsync/shared';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  X,
  Box,
  GitBranch,
} from 'lucide-react';

export interface ValidationPanelProps {
  validationResult?: ArchitectureValidationResult;
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
          <span className="inline-flex items-center gap-1 rounded-md bg-[#ef8557]/20 px-2 py-0.5 text-[11px] font-semibold text-[#ef8557] border border-[#ef8557]/50 font-mono">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            ERROR
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#ef8557]/10 px-2 py-0.5 text-[11px] font-semibold text-[#ef8557] border border-[#ef8557]/30 font-mono">
            <AlertCircle className="h-3 w-3 shrink-0" />
            WARNING
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#226192]/10 px-2 py-0.5 text-[11px] font-semibold text-[#226192] border border-[#226192]/20 font-mono">
            <Info className="h-3 w-3 shrink-0" />
            INFO
          </span>
        );
    }
  };

  return (
    <div
      data-testid="validation-panel"
      className="flex flex-col h-full w-full bg-[#eae6ed] border-l border-[#226192]/15 text-[#226192] shadow-xl"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#226192]/15 bg-[#eae6ed]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#226192]/10 text-[#ef8557] border border-[#ef8557]/40">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-medium text-[#226192] tracking-wide">Architecture Validation</h3>
            <p className="text-[11px] font-mono text-[#226192]/70">Rules engine structural integrity</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onValidate}
            disabled={isValidating}
            data-testid="run-validation-btn"
            className="flex items-center gap-1.5 rounded-md border border-[#226192]/20 bg-[#eae6ed] px-2.5 py-1.5 text-xs font-medium text-[#226192] transition-colors hover:bg-[#226192]/5 hover:border-[#226192]/35 disabled:opacity-50 focus:ring-2 focus:ring-[#ef8557]"
            title="Re-run architecture validation"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#ef8557] ${isValidating ? 'animate-spin' : ''}`} />
            <span>{isValidating ? 'Validating...' : 'Validate'}</span>
          </button>

          <button
            onClick={onClose}
            data-testid="close-validation-panel-btn"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#226192]/70 hover:bg-[#226192]/5 hover:text-[#226192] transition-colors"
            title="Close validation panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Summary Status Banner */}
      <div className="p-4 border-b border-[#226192]/15 bg-[#226192]/[0.02]">
        {validationResult && validationResult.valid && issues.length === 0 ? (
          <div className="flex items-start gap-3 rounded-lg border border-[#226192]/25 bg-[#226192]/10 p-3.5 text-[#226192]">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#226192] mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#226192]">Architecture is Structurally Valid</h4>
              <p className="mt-0.5 text-[11px] text-[#226192]/80 leading-relaxed">
                No structural errors, disconnected nodes, or circular dependencies detected.
              </p>
            </div>
          </div>
        ) : validationResult && !validationResult.valid ? (
          <div className="flex items-start gap-3 rounded-lg border border-[#ef8557]/40 bg-[#ef8557]/15 p-3.5 text-[#ef8557]">
            <ShieldAlert className="h-5 w-5 shrink-0 text-[#ef8557] mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#ef8557]">Structural Errors Detected</h4>
              <p className="mt-0.5 text-[11px] text-[#ef8557]/80 leading-relaxed">
                The architecture contains invalid graph configurations that must be resolved.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-[#ef8557]/30 bg-[#ef8557]/10 p-3.5 text-[#ef8557]">
            <AlertCircle className="h-5 w-5 shrink-0 text-[#ef8557] mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#ef8557]">Architecture Warnings Found</h4>
              <p className="mt-0.5 text-[11px] text-[#ef8557]/80 leading-relaxed">
                The diagram is valid but has structural warnings that should be reviewed.
              </p>
            </div>
          </div>
        )}

        {/* Issue Counts Bar */}
        {issues.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#ef8557]/20 border border-[#ef8557]/40 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-[#ef8557]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef8557]" />
                {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#ef8557]/10 border border-[#ef8557]/30 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-[#ef8557]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef8557]" />
                {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
              </span>
            )}
            {infoCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#226192]/10 border border-[#226192]/20 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-[#226192]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#226192]" />
                {infoCount} Info
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#226192]/70">
            <CheckCircle2 className="h-10 w-10 text-[#226192]/40 mb-2" />
            <p className="text-xs font-medium text-[#226192]">No validation issues</p>
            <p className="text-[11px] text-[#226192]/70 mt-1 max-w-xs">
              Every node and edge satisfies all structural rules in the architecture engine.
            </p>
          </div>
        ) : (
          issues.map((issue: ValidationIssue) => (
            <div
              key={issue.id}
              data-testid={`validation-issue-${issue.id}`}
              className="rounded-lg border border-[#226192]/15 bg-[#226192]/[0.03] p-3.5 transition-colors hover:border-[#226192]/30"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                {renderSeverityBadge(issue.severity)}
                <span className="text-[10px] font-mono font-medium text-[#226192]/70">
                  {issue.code}
                </span>
              </div>

              <p className="text-xs text-[#226192] leading-relaxed font-normal">
                {issue.message}
              </p>

              {/* Related Nodes Badges */}
              {issue.nodeIds && issue.nodeIds.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#226192]/70 font-mono">Nodes:</span>
                  {issue.nodeIds.map((nodeId) => (
                    <button
                      key={nodeId}
                      onClick={() => onSelectNode?.(nodeId)}
                      className="inline-flex items-center gap-1 rounded border border-[#226192]/20 bg-[#eae6ed] px-1.5 py-0.5 text-[11px] font-mono text-[#226192] transition-colors hover:border-[#ef8557]"
                      title={`Select node "${nodeId}" on canvas`}
                    >
                      <Box className="h-2.5 w-2.5 text-[#ef8557]" />
                      {nodeId}
                    </button>
                  ))}
                </div>
              )}

              {/* Related Edges Badges */}
              {issue.edgeIds && issue.edgeIds.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#226192]/70 font-mono">Edges:</span>
                  {issue.edgeIds.map((edgeId) => (
                    <button
                      key={edgeId}
                      onClick={() => onSelectEdge?.(edgeId)}
                      className="inline-flex items-center gap-1 rounded border border-[#226192]/20 bg-[#eae6ed] px-1.5 py-0.5 text-[11px] font-mono text-[#226192] transition-colors hover:border-[#ef8557]"
                      title={`Select edge "${edgeId}" on canvas`}
                    >
                      <GitBranch className="h-2.5 w-2.5 text-[#ef8557]" />
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
        <div className="px-4 py-2.5 border-t border-[#226192]/15 bg-[#eae6ed] text-[10px] text-[#226192]/70 flex items-center justify-between">
          <span>Validated at:</span>
          <span className="font-mono text-[#226192]">
            {new Date(validationResult.validatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};
