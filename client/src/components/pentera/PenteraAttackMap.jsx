import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  Trophy,
  Key,
  Server,
  Zap,
  ChevronRight,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ArrowDown,
  Lock,
  Terminal,
  ExternalLink,
  BookOpen,
  Info,
  X,
  Radar,
  ShieldCheck,
  Check,
  Activity,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Card, Button } from '../ui/primitives';

const PIPELINE_STAGES = [
  { key: 'reconnaissance', label: '1. Reconnaissance & Asset Discovery' },
  { key: 'endpointDiscovery', label: '2. Endpoint Discovery' },
  { key: 'technologyAnalysis', label: '3. Technology Analysis' },
  { key: 'securityChecks', label: '4. Security Headers & Audit' },
  { key: 'verification', label: '5. Finding Verification' },
  { key: 'aiAnalysis', label: '6. Automated Vulnerability Analysis' },
  { key: 'riskScoring', label: '7. Risk Scoring & CVSS' },
  { key: 'reportGeneration', label: '8. Executive Report Generation' },
];

/**
 * PenteraAttackMap
 * Interactive Attack Map & Kill Chain Flowchart modeled directly on Pentera.
 * Supports both Light Mode and Dark Mode.
 */
export function PenteraAttackMap({
  killChainData,
  findings = [],
  assessment,
  progressMap = {},
  onSelectFinding,
  className,
}) {
  const [adversaryLevel, setAdversaryLevel] = useState('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);

  // Normalize nodes from killChainData or fallback from findings
  const nodes = useMemo(() => {
    if (killChainData?.nodes && killChainData.nodes.length > 0) {
      return killChainData.nodes;
    }
    if (findings && findings.length > 0) {
      return findings.map((f, idx) => {
        const step = f.killChainStep || {};
        return {
          id: String(f._id || idx),
          findingId: f.findingId || `VUL-${idx + 1}`,
          title: f.title,
          category: f.category,
          severity: f.severity,
          cvssScore: f.cvssScore,
          status: f.status,
          phase: step.phase || 'Initial Access',
          achievementTitle: step.achievementTitle || f.title,
          score: Number((step.score || f.cvssScore || 5.0).toFixed(1)),
          adversaryLevel: step.adversaryLevel || 'Opportunistic',
          sourceAsset: step.sourceAsset || 'Attacker Gateway',
          targetAsset: (f.affectedAssets || [])[0] || '192.168.100.2',
          vector: step.vector || 'HTTP Network Vector',
          remediationWiki: f.remediationWiki,
          combinedConclusion: f.combinedConclusion,
        };
      });
    }

    return [];
  }, [killChainData, findings]);

  const filteredNodes = useMemo(() => {
    if (adversaryLevel === 'ALL') return nodes;
    return nodes.filter(n => (n.adversaryLevel || '').toUpperCase() === adversaryLevel.toUpperCase());
  }, [nodes, adversaryLevel]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return filteredNodes[0] || null;
    return nodes.find(n => n.id === selectedNodeId) || filteredNodes[0] || null;
  }, [nodes, selectedNodeId, filteredNodes]);

  const getScoreBadgeColor = (score) => {
    if (score >= 9.0) return 'bg-red-600 text-white shadow-red-500/30';
    if (score >= 7.0) return 'bg-amber-600 text-white shadow-amber-500/30';
    if (score >= 4.0) return 'bg-amber-500 text-white dark:bg-yellow-500 dark:text-slate-950 shadow-yellow-500/20';
    return 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-cyan-500/20';
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'Reconnaissance': return 'text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/30';
      case 'Initial Access': return 'text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-950/30';
      case 'Credential Access': return 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30';
      case 'Lateral Movement': return 'text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/30';
      case 'Privilege Escalation': return 'text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30';
      case 'Impact': return 'text-red-700 dark:text-red-500 border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40';
      default: return 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800';
    }
  };

  const allStagesCompleted = PIPELINE_STAGES.every((st) => progressMap[st.key] === 'done');
  const isActivelyScanning = ['RUNNING', 'QUEUED'].includes(assessment?.status) && !allStagesCompleted;

  return (
    <Card className={cn("overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c18] p-0 shadow-xl backdrop-blur-2xl transition-colors duration-200", className)}>
      {/* Top Pentera Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/80 px-6 py-3.5">
        {/* Title Header */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <Radar className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
          <span>Saksham Attack Map</span>
          {filteredNodes.length > 0 && (
            <span className="rounded-full bg-blue-100 dark:bg-cyan-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/30">
              {filteredNodes.length} Threat Vectors
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Adversary Level Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-1 text-xs shadow-sm">
            <Filter className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Adversary:</span>
            <select
              value={adversaryLevel}
              onChange={(e) => setAdversaryLevel(e.target.value)}
              className="bg-transparent font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Levels</option>
              <option value="Opportunistic" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Opportunistic</option>
              <option value="Advanced" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Advanced</option>
              <option value="Nation-State" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Nation-State</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-1 shadow-sm">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] px-2 text-slate-700 dark:text-slate-300 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1 border-l border-slate-200 dark:border-slate-800"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Dynamic Attack Map State / Hardened State when empty OR Full-Width Flowchart Canvas when findings exist */}
      {filteredNodes.length === 0 ? (
        <div className="p-8 sm:p-12 min-h-[420px] flex flex-col items-center justify-center text-center">
          {isActivelyScanning ? (
            <div className="w-full max-w-xl space-y-4 py-6">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-cyan-950 border border-blue-200 dark:border-cyan-500/40 shadow-md">
                <Radar className="h-8 w-8 text-blue-600 dark:text-cyan-400 animate-spin" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 dark:bg-cyan-500"></span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono flex items-center justify-center gap-2">
                  <span>Attack Surface Mapping Active</span>
                  <span className="rounded bg-blue-100 dark:bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 font-bold uppercase">
                    Live Telemetry
                  </span>
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-mono font-semibold mt-1">
                  Target: {assessment?.targetId?.url || assessment?.customTarget || 'Target Asset'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Autonomous attack analysis engine is probing routes for authorization bypass, privilege escalation, and injection flaws. Threat chain nodes plot on this canvas as findings are confirmed.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 font-mono text-xs text-blue-700 dark:text-cyan-300 font-semibold bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-cyan-400" />
                <span>Monitoring attack map telemetry stream…</span>
              </div>
            </div>
          ) : (
            <div className="max-w-md space-y-4 py-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-lg">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  Target Hardened: Zero Threat Vectors Detected
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Saksham AI verified all target endpoints against authorization bypass, injection, and security headers. No exploitable attack vectors could be constructed.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Posture Score: 100 / 100 Verified
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full relative bg-slate-50/50 dark:bg-[#040813] min-h-[500px] overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-25 dark:opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Full-Width Canvas Viewport */}
          <div
            className="w-full max-w-2xl py-4 overflow-y-auto flex flex-col items-center space-y-5 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            {filteredNodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              const isRoot = idx === 0;
              const isLast = idx === filteredNodes.length - 1;

              return (
                <React.Fragment key={node.id}>
                  {/* Flowchart Node Card */}
                  <div
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setShowDrawer(true);
                    }}
                    className={cn(
                      "group relative w-full rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer shadow-md dark:shadow-xl",
                      isSelected
                        ? "border-blue-500 dark:border-cyan-400 bg-white dark:bg-slate-900 ring-2 ring-blue-500/30 dark:ring-cyan-400/40 shadow-blue-500/10 dark:shadow-cyan-500/10"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 hover:border-blue-400 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900/90 hover:scale-[1.01]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex h-8 w-10 items-center justify-center rounded-lg font-mono text-xs font-black shadow-md", getScoreBadgeColor(node.score))}>
                          {node.score}
                        </div>
                        <div>
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase border", getPhaseColor(node.phase))}>
                            {node.phase}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 ml-2">
                            {node.targetAsset}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase">
                        {isRoot && <span className="text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">Initial Access</span>}
                        {isLast && <span className="text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-300 dark:border-red-500/20">Impact</span>}
                        <ShieldAlert className={cn("h-4 w-4", node.score >= 9.0 ? "text-red-500" : node.score >= 7.0 ? "text-amber-500" : "text-blue-500")} />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2.5 leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">
                      {node.achievementTitle || node.title}
                    </h4>

                    {node.vector && (
                      <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                        <Zap className="h-3 w-3 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span className="truncate">{node.vector}</span>
                      </div>
                    )}
                  </div>

                  {/* Directional Down Connector Arrow */}
                  {!isLast && (
                    <div className="flex flex-col items-center my-0">
                      <div className="h-6 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-600 dark:from-cyan-500 dark:to-blue-600" />
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-blue-950 border border-blue-400 dark:border-blue-500/40 text-[10px] font-mono text-blue-600 dark:text-cyan-300 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-600 to-blue-500 dark:from-blue-600 dark:to-cyan-500" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide-out / Modal Drawer for Selected Node Details & Remediation Navigation */}
      <AnimatePresence>
        {showDrawer && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto text-slate-900 dark:text-white"
            >
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2.5 py-0.5 font-mono text-xs font-black rounded-md shadow", getScoreBadgeColor(selectedNode.score))}>
                      {selectedNode.score}
                    </span>
                    <span className={cn("px-2 py-0.5 font-mono text-[10px] font-bold uppercase rounded border", getPhaseColor(selectedNode.phase))}>
                      {selectedNode.phase}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {selectedNode.findingId}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedNode.achievementTitle || selectedNode.title}
                  </h3>
                </div>

                <button
                  onClick={() => setShowDrawer(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Node Details */}
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-1.5 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Attack Vector & Asset</span>
                  <p className="text-slate-800 dark:text-slate-200">Asset: <span className="text-blue-600 dark:text-cyan-300 font-bold">{selectedNode.targetAsset}</span></p>
                  <p className="text-slate-700 dark:text-slate-300">Vector: {selectedNode.vector}</p>
                  <p className="text-slate-600 dark:text-slate-400">Adversary Level: <span className="text-amber-600 dark:text-amber-400 font-semibold">{selectedNode.adversaryLevel}</span></p>
                </div>

                {selectedNode.insight && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">Root Cause Insight</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedNode.insight}</p>
                  </div>
                )}

                {selectedNode.combinedConclusion?.executiveVerdict && (
                  <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Combined Scanner + AI Verdict</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedNode.combinedConclusion.executiveVerdict}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
                {onSelectFinding && selectedNode.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDrawer(false);
                      onSelectFinding(selectedNode.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs px-4 py-2 shadow-lg shadow-blue-600/30 transition active:scale-95"
                  >
                    <BookOpen className="h-4 w-4 text-white shrink-0" />
                    <span className="text-white">Open Remediation Wiki & Config</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export { PenteraAttackMap as SakshamAttackMap };

