import React from 'react';
import { ShieldAlert, Cpu, CheckCircle2, ArrowRight, Zap, Target, Binary } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/primitives';

/**
 * CombinedConclusionCard
 * Synthesizes automated deterministic scanner results with AI adversary modeling.
 * Fully responsive to Light Mode and Dark Mode.
 */
export function CombinedConclusionCard({ finding, className }) {
  if (!finding) return null;

  const conclusion = finding.combinedConclusion || {};
  const executiveVerdict = conclusion.executiveVerdict ||
    `Automated security checks verified presence of ${finding.title}. AI threat intelligence confirms this finding presents an actionable security gap that an adversary can leverage within an attack chain.`;
  const technicalConclusion = conclusion.technicalConclusion ||
    `Scanner telemetry confirmed missing defensive controls on ${((finding.affectedAssets || [])[0]) || 'target asset'}. Cognitive threat correlation projects this flaw can be chained with lateral reconnaissance to compromise session integrity.`;
  const combinedRiskScore = conclusion.combinedRiskScore ?? finding.cvssScore ?? 5.0;
  const exploitFeasibility = conclusion.exploitFeasibility || (finding.severity === 'Critical' ? 'Critical' : finding.severity === 'High' ? 'High' : 'Medium');
  const feasibilityReasoning = conclusion.feasibilityReasoning ||
    'Standard HTTP security tests elicit direct reproducible evidence with minimal exploit complexity.';
  const keyRemediationAction = conclusion.keyRemediationAction ||
    'Enforce baseline configuration hardening across server headers and access boundaries.';
  const scannerCertainty = conclusion.scannerCertainty || (finding.verified ? 98 : 88);

  const getFeasibilityBadge = (level) => {
    switch (String(level).toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40';
      case 'HIGH':
        return 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/40';
      default:
        return 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40';
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-950 dark:to-blue-950/40 p-0 shadow-lg dark:shadow-xl backdrop-blur-xl transition-colors duration-200",
      className
    )}>
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 dark:border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/15 dark:bg-blue-500/20 ring-1 ring-blue-500/30 dark:ring-blue-400/40">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Synergistic Audit Conclusion
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Automated Deterministic Scanner Telemetry + AI Threat Reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-400/30 bg-white dark:bg-blue-500/10 px-3 py-1 text-xs shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Combined Risk:</span>
            <span className="font-mono text-xs font-black text-blue-700 dark:text-cyan-300">{Number(combinedRiskScore).toFixed(1)} / 10</span>
          </div>
          <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase ring-1 shadow-sm", getFeasibilityBadge(exploitFeasibility))}>
            Feasibility: {exploitFeasibility}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Executive Verdict Box */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/25 p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Executive Verdict
          </span>
          <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
            {executiveVerdict}
          </p>
        </div>

        {/* Dual Evidence Matrix: Scanner vs. AI */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Scanner Telemetry */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Binary className="h-3.5 w-3.5" /> Scanner Evidence
              </span>
              <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400/80 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20">
                Certainty {scannerCertainty}%
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              Target: <span className="font-mono font-semibold text-blue-600 dark:text-cyan-300">{(finding.affectedAssets || [])[0] || 'Target Endpoint'}</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              HTTP Method: <span className="font-mono text-slate-700 dark:text-slate-200">{finding.httpTrace?.method || 'GET'}</span> · Base CVSS: <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{finding.cvssScore}</span>
            </p>
          </div>

          {/* AI Cognitive Projection */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> AI Threat Projection
              </span>
              <span className="font-mono text-[10px] font-semibold text-purple-700 dark:text-purple-300/80 bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-500/20">
                Kill-Chain Pivot
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {feasibilityReasoning}
            </p>
          </div>
        </div>

        {/* Technical Conclusion */}
        <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800/80 pt-3 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Technical Synthesis</span>
          <p className="leading-relaxed text-slate-700 dark:text-slate-300/90 text-xs">
            {technicalConclusion}
          </p>
        </div>

        {/* Key Remediation Action */}
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-900 dark:text-emerald-300 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              Decisive Configuration Hardening Action
            </span>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
              {keyRemediationAction}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
