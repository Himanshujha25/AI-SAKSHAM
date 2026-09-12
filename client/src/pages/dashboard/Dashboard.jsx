import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ShieldCheck, Radar, FlaskConical, BadgeCheck, SearchCheck,
  Play, X, Globe, Cpu, Zap, Code2, GitFork, Layers,
  Lock, FileCode, Box, AlertOctagon, AlertTriangle, BarChart2,
  CheckCircle2, TrendingUp, Activity, Clock, FolderPlus, ArrowRight,
  ShieldAlert, Sparkles, ChevronRight
} from 'lucide-react';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge, SeverityBadge, MicroLabel } from '../../components/shared/shared';
import { CustomSelect } from '../../components/ui/CustomSelect';

const SEVERITY_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#64748b'];

// Left items specification - Attack Surface Sources
const LEFT_ITEMS = [
  { key: 'api', label: 'API Endpoints', icon: Code2, color: '#0ea5e9' },
  { key: 'route', label: 'Routes', icon: GitFork, color: '#0ea5e9' },
  { key: 'technology', label: 'Technologies', icon: Layers, color: '#0ea5e9' },
  { key: 'header', label: 'Security Headers', icon: Lock, color: '#0ea5e9' },
  { key: 'js', label: 'JS Assets', icon: FileCode, color: '#0ea5e9' },
  { key: 'dependency', label: 'Dependencies', icon: Box, color: '#0ea5e9' },
];

// Right items specification - Severity & Findings Results
const RIGHT_ITEMS_SEV = [
  { key: 'Critical', label: 'Critical', icon: AlertOctagon, color: '#ef4444', bg: 'bg-red-500/10 text-red-400 border-red-500/30' },
  { key: 'High', label: 'High', icon: AlertTriangle, color: '#f97316', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  { key: 'Medium', label: 'Medium', icon: BarChart2, color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { key: 'Low', label: 'Low', icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
];

// Professional Security Analysis Pipeline Node
function SecurityAnalysisHub({ value, score, isScanning, activeStage, orbRef }) {
  return (
    <div ref={orbRef} className="relative mx-auto flex h-52 w-52 items-center justify-center md:h-60 md:w-60">
      {/* Structural Dual Rings */}
      <div className="absolute inset-0 rounded-full border border-slate-700/60 bg-[#070d1a] shadow-inner" />
      <div className="absolute inset-2 rounded-full border border-cyan-500/20 bg-[#091024] shadow-xl flex items-center justify-center">
        <div className="absolute inset-3 rounded-full border border-slate-800/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
          <ShieldCheck size={22} className={isScanning ? 'animate-pulse' : ''} />
        </div>

        {isScanning ? (
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 animate-pulse block">
              {activeStage || 'ANALYSIS IN PROGRESS'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Processing Pipeline...</span>
          </div>
        ) : (
          <div>
            <span className="text-3xl font-extrabold tracking-tight text-white block">{value}</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Tracked Findings</span>
            <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
              SCORE {score ?? '—'}/100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Start Scan Modal Form
function StartScanModal({ isOpen, onClose, onLaunched }) {
  const [projectName, setProjectName] = useState('World Monitor Project');
  const [targetName, setTargetName] = useState('World Monitor Core API');
  const [targetUrl, setTargetUrl] = useState('http://localhost:5000');
  const [environment, setEnvironment] = useState('Testing');
  const [scanType, setScanType] = useState('Standard');
  const [customHeaders, setCustomHeaders] = useState('');
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!targetUrl || !targetUrl.trim()) {
      setErrorMsg('Target URL is required.');
      return;
    }
    if (!authorizationConfirmed) {
      setErrorMsg('You must confirm authorization before starting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let projectId;
      const projectsRes = await api.get('/projects');
      const existingProj = (projectsRes.data?.projects || []).find((p) => p.name.toLowerCase() === projectName.toLowerCase());
      if (existingProj) {
        projectId = existingProj._id;
      } else {
        const newProjRes = await api.post('/projects', { name: projectName, description: `Security assessment for ${targetName}` });
        projectId = newProjRes.data.project._id;
      }

      const targetRes = await api.post(`/projects/${projectId}/targets`, {
        name: targetName,
        url: targetUrl,
        environment,
        customHeaders,
        authorizationConfirmed: true,
      });
      const targetId = targetRes.data.target._id;

      const assessmentRes = await api.post('/assessments', {
        projectId,
        targetId,
        type: scanType,
        authorizationConfirmed: true,
      });

      setIsSubmitting(false);
      onLaunched(assessmentRes.data.assessment);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to launch assessment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-800 bg-[#091024] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
            <Zap className="text-cyan-400" size={18} />
            Start Security Assessment
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMsg && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Target Name</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Environment</label>
              <CustomSelect
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                options={['Testing', 'Staging', 'Production']}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Target URL</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-3 text-cyan-400" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3.5 py-2 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Scan Profile</label>
            <CustomSelect
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              options={[
                { value: 'Standard', label: 'Standard Audit (Header + IDOR + Endpoint Discovery)' },
                { value: 'Quick', label: 'Quick Recon (Probing & Response Auditing)' },
                { value: 'Comprehensive', label: 'Comprehensive Enterprise Audit + Severity Analysis' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Auth Token / Custom HTTP Headers (Optional for Admin Access)
            </label>
            <input
              type="text"
              placeholder="Authorization: Bearer <token> or Cookie: admin_session=123"
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={authorizationConfirmed}
                onChange={(e) => setAuthorizationConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-xs text-slate-300 leading-normal">
                I explicitly confirm authorization to assess this target URL.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 border border-cyan-400/30"
            >
              {isSubmitting ? <Cpu size={14} className="animate-spin text-white" /> : <Play size={14} className="fill-current" />}
              {isSubmitting ? 'Starting...' : 'Launch Assessment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function Dashboard() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [liveSocketProgress, setLiveSocketProgress] = useState(null);

  const panelRef = useRef(null);
  const orbRef = useRef(null);
  const leftRefs = useRef([]);
  const rightRefs = useRef([]);

  const [wireData, setWireData] = useState({ width: 0, height: 0, leftPaths: [], rightPaths: [] });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard/overview')).data,
    refetchInterval: activeAssessmentId ? 2500 : 15000,
  });

  const latestId = activeAssessmentId || data?.recentAssessments?.[0]?._id;
  const assetsQuery = useQuery({
    queryKey: ['dashboard-assets', latestId],
    queryFn: async () => (await api.get(`/assessments/${latestId}`)).data,
    enabled: !!latestId,
    refetchInterval: activeAssessmentId ? 2500 : false,
  });

  useEffect(() => {
    if (!latestId) return;
    const socket = getSocket();
    socket.emit('assessment:subscribe', latestId);

    const onProgress = (payload) => {
      if (payload?.assessmentId === String(latestId)) {
        setLiveSocketProgress(payload);
        if (payload.status === 'COMPLETED' || payload.done) {
          setActiveAssessmentId(null);
          qc.invalidateQueries({ queryKey: ['dashboard'] });
          qc.invalidateQueries({ queryKey: ['dashboard-assets', latestId] });
        }
      }
    };

    socket.on('assessment:progress', onProgress);
    return () => {
      socket.off('assessment:progress', onProgress);
    };
  }, [latestId, qc]);

  // Professional Security Pipeline Wire Calculator
  const calculateWires = () => {
    if (!panelRef.current || !orbRef.current) return;
    const panelRect = panelRef.current.getBoundingClientRect();
    const orbRect = orbRef.current.getBoundingClientRect();

    if (panelRect.width < 768) {
      setWireData({ width: panelRect.width, height: panelRect.height, leftPaths: [], rightPaths: [] });
      return;
    }

    const orbCenterX = orbRect.left + orbRect.width / 2 - panelRect.left;
    const orbCenterY = orbRect.top + orbRect.height / 2 - panelRect.top;
    const orbRadius = (orbRect.width / 2) - 4;

    const leftYOffsets = [-54, -32, -10, 10, 32, 54];

    const leftPaths = LEFT_ITEMS.map((item, idx) => {
      const el = leftRefs.current[idx];
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const startX = rect.right - panelRect.left;
      const startY = rect.top + rect.height / 2 - panelRect.top;

      const termY = orbCenterY + (leftYOffsets[idx] || 0);
      const dy = termY - orbCenterY;
      const termX = orbCenterX - Math.sqrt(Math.max(0, orbRadius * orbRadius - dy * dy));

      const dx = termX - startX;
      const cp1X = startX + dx * 0.45;
      const cp1Y = startY;
      const cp2X = termX - dx * 0.45;
      const cp2Y = termY;

      return {
        id: `left-${idx}`,
        d: `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${termX} ${termY}`,
        startX, startY,
        endX: termX, endY: termY,
        color: item.color,
      };
    }).filter(Boolean);

    const rightYOffsets = [-48, -24, 0, 24, 48];
    const rightItemsList = [
      ...RIGHT_ITEMS_SEV,
      { key: 'Verified', label: 'Verified Findings', icon: ShieldCheck, color: '#06b6d4' },
    ];

    const rightPaths = rightItemsList.map((item, idx) => {
      const el = rightRefs.current[idx];
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const endX = rect.left - panelRect.left;
      const endY = rect.top + rect.height / 2 - panelRect.top;

      const termY = orbCenterY + (rightYOffsets[idx] || 0);
      const dy = termY - orbCenterY;
      const termX = orbCenterX + Math.sqrt(Math.max(0, orbRadius * orbRadius - dy * dy));

      const dx = endX - termX;
      const cp1X = termX + dx * 0.45;
      const cp1Y = termY;
      const cp2X = endX - dx * 0.45;
      const cp2Y = endY;

      return {
        id: `right-${idx}`,
        d: `M ${termX} ${termY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`,
        startX: termX, startY: termY,
        endX, endY,
        color: item.color,
      };
    }).filter(Boolean);

    setWireData({ width: panelRect.width, height: panelRect.height, leftPaths, rightPaths });
  };

  useLayoutEffect(() => {
    calculateWires();
    const handleResize = () => calculateWires();
    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(() => calculateWires());
    if (panelRef.current) observer.observe(panelRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [isLoading, data, assetsQuery.data]);

  if (isLoading) return <LoadingState label="Establishing security operations link…" />;
  if (isError) return <ErrorState message="Could not load dashboard posture data. Is backend API active?" onRetry={() => refetch()} />;

  const isScanning = !!activeAssessmentId || liveSocketProgress?.status === 'RUNNING';
  const activeStage = liveSocketProgress?.stage;

  const counts = {};
  (assetsQuery.data?.assets || []).forEach((a) => { counts[a.type] = (counts[a.type] || 0) + 1; });
  const pie = Object.entries(data.severity || {}).map(([name, value]) => ({ name, value }));
  const sev = data.severity || {};
  const activeTotal = (sev.Critical || 0) + (sev.High || 0) + (sev.Medium || 0) + (sev.Low || 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            Security Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Live attack surface posture & security audit pipeline</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white transition shadow-sm border border-cyan-400/30"
        >
          <Zap size={14} className="fill-current text-white" />
          <span>Start Assessment</span>
        </button>
      </div>

      <StartScanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLaunched={(assessment) => {
          setActiveAssessmentId(assessment._id);
          refetch();
        }}
      />

      {/* Active Scan Progress Banner */}
      {isScanning && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3.5">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                Active Assessment Pipeline Executing...
              </p>
              <p className="text-[11px] font-mono text-cyan-300 mt-0.5">
                Stage: {activeStage || 'RECONNAISSANCE & PROBING'}
              </p>
            </div>
          </div>
          <Link to={`/assessments/${latestId}`} className="rounded-lg bg-cyan-500/20 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30">
            View Stream →
          </Link>
        </motion.div>
      )}

      {/* ——— Main Attack Surface & Pipeline Routing Hub ——— */}
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#090f1f] p-6 shadow-xl"
      >
        {/* Subtle Restrained Pipeline Connectors SVG */}
        {wireData.width > 0 && (
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" width={wireData.width} height={wireData.height}>
            <defs>
              <style>{`
                @keyframes subtleStream {
                  from { stroke-dashoffset: 24; }
                  to { stroke-dashoffset: 0; }
                }
                .pipeline-stream {
                  stroke-dasharray: 4 8;
                  animation: subtleStream ${isScanning ? '0.8s' : '1.8s'} linear infinite;
                }
              `}</style>
            </defs>

            {/* Left Source Paths */}
            {wireData.leftPaths.map((path) => (
              <g key={path.id}>
                <path d={path.d} fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <path d={path.d} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <path d={path.d} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" className="pipeline-stream" opacity="0.8" />
                <circle cx={path.startX} cy={path.startY} r="3" fill="#0ea5e9" />
                <circle cx={path.endX} cy={path.endY} r="3" fill="#0ea5e9" />
              </g>
            ))}

            {/* Right Result Paths */}
            {wireData.rightPaths.map((path) => (
              <g key={path.id}>
                <path d={path.d} fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <path d={path.d} fill="none" stroke={path.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <path d={path.d} fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" className="pipeline-stream" opacity="0.7" />
                <circle cx={path.startX} cy={path.startY} r="3" fill={path.color} />
                <circle cx={path.endX} cy={path.endY} r="3" fill={path.color} />
              </g>
            ))}
          </svg>
        )}

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_1fr_1.2fr] lg:items-center">
          {/* Left Column: Attack Surface Sources */}
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.35 }} className="min-w-0">
            <div className="mb-3.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Radar size={13} className="text-cyan-400" /> SOURCES · ATTACK SURFACE
            </div>
            <ul className="flex flex-col gap-2">
              {LEFT_ITEMS.map((item, idx) => (
                <li
                  key={item.key}
                  ref={(el) => (leftRefs.current[idx] = el)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#070c18] px-3.5 py-2.5 text-xs font-semibold transition hover:border-slate-700 hover:bg-[#0a1224]"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-900 border border-slate-800 text-cyan-400">
                      <item.icon size={13} />
                    </span>
                    <span className="truncate text-slate-200">{item.label}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300 rounded bg-slate-800/80 px-2 py-0.5">
                    {assetsQuery.isLoading ? '…' : (counts[item.key] || 0)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Center Column: Security Analysis Hub Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
            className="min-w-0 text-center"
          >
            <SecurityAnalysisHub
              orbRef={orbRef}
              value={data.totalFindings}
              score={data.securityScore}
              isScanning={isScanning}
              activeStage={activeStage}
            />
          </motion.div>

          {/* Right Column: Active Cases & Resolved Signals */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.35 }} className="min-w-0 space-y-4">
            <div>
              <div className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                ACTIVE CASES ({activeTotal})
              </div>
              <div className="flex flex-col gap-2">
                {RIGHT_ITEMS_SEV.map((item, i) => (
                  <div
                    key={item.key}
                    ref={(el) => (rightRefs.current[i] = el)}
                  >
                    <Link to="/findings" className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#070c18] px-3.5 py-2.5 text-xs font-semibold transition hover:border-slate-700 hover:bg-[#0a1224]">
                      <span className="flex items-center gap-2.5">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${item.bg}`}>
                          <item.icon size={13} />
                        </span>
                        <span className="text-slate-200">{item.label}</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-white">{sev[item.key] || 0}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BadgeCheck size={13} className="text-emerald-400" /> RESOLVED SIGNAL
              </div>
              <div
                ref={(el) => (rightRefs.current[4] = el)}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#070c18] px-3.5 py-2.5 text-xs font-semibold transition hover:border-emerald-500/40 hover:bg-[#0a1224]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                    <ShieldCheck size={13} />
                  </span>
                  <span className="text-slate-200">Verified Findings</span>
                </span>
                <span className="font-mono text-sm font-bold text-cyan-400">{data.verifiedFindings}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ——— Compact Metric Cards ——— */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
        className="grid grid-cols-2 gap-3 lg:grid-cols-5"
      >
        <StatCardWithSparkline label="SECURITY SCORE" value={`${data.securityScore ?? '78'}/100`} badge="+12%" icon={ShieldCheck} stroke="#0ea5e9" />
        <StatCardWithSparkline label="TOTAL FINDINGS" value={data.totalFindings} badge="+2 new" icon={Radar} stroke="#0ea5e9" />
        <StatCardWithSparkline label="ASSESSMENTS" value={data.recentAssessments?.length ?? 0} badge="+1 today" icon={FlaskConical} stroke="#0ea5e9" />
        <StatCardWithSparkline label="UNDER REVIEW" value={(data.recentFindings || []).filter((f) => f.status === 'Under Review').length} badge="-50%" icon={SearchCheck} stroke="#f59e0b" />
        <StatCardWithSparkline label="VERIFIED" value={data.verifiedFindings} badge="100%" icon={BadgeCheck} stroke="#10b981" />
      </motion.div>

      {/* ——— Distribution and Activity Grid ——— */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Severity Distribution Donut & Interactive Breakdown */}
        <SeverityDistributionSection pie={pie} sev={sev} activeTotal={activeTotal} />

        {/* Live Assessment Activity Timeline Stream */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase font-mono">
              <Activity size={15} className="text-cyan-400" />
              Assessment Activity Stream
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              REALTIME
            </span>
          </div>

          {(data.activity || []).length === 0 ? (
            <EmptyState title="No activity recorded" hint="Project security events will stream here." />
          ) : (
            <div className="space-y-2">
              {(data.activity || []).slice(0, 6).map((a, idx) => {
                const isStarted = a.action?.toLowerCase().includes('started');
                const isQueued = a.action?.toLowerCase().includes('queued');
                const isCreated = a.action?.toLowerCase().includes('created');

                return (
                  <motion.div
                    key={a._id || idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * idx }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-[#060a14] p-2.5 transition duration-150 hover:border-slate-700 hover:bg-slate-900/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        isStarted ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                        isQueued ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        isCreated ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                        'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {isStarted ? <Play size={11} /> :
                         isQueued ? <Clock size={11} /> :
                         isCreated ? <FolderPlus size={11} /> :
                         <Activity size={11} />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{a.action}</span>
                          {a.detail && (
                            <span className="rounded border border-slate-700/60 bg-slate-800/90 px-1.5 py-0.2 font-mono text-[10px] font-medium text-slate-300">
                              {a.detail}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          Security Assessment Event Execution
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-slate-400">
                      {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </PremiumCard>
      </motion.div>

      {/* ——— Recent Security Findings Feed ——— */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <PremiumCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase font-mono">
                <ShieldAlert size={15} className="text-cyan-400" />
                Recent Verified Findings Intel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Vulnerability evidence payloads & audit traces</p>
            </div>
            <Link
              to="/findings"
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              Explore All Findings <ArrowRight size={13} />
            </Link>
          </div>

          {(data.recentFindings || []).length === 0 ? (
            <EmptyState title="No findings detected" hint="Run an assessment on an authorized target." />
          ) : (
            <ul className="flex flex-col gap-2">
              {(data.recentFindings || []).map((f, idx) => (
                <motion.li
                  key={f._id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.04 }}
                  className="group rounded-lg border border-slate-800/80 bg-[#060a14] transition duration-150 hover:border-slate-700 hover:bg-slate-900/60"
                >
                  <Link to={`/findings/${f._id}`} className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400">
                        {f.findingId}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition">
                          {f.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Target Route: <code className="text-slate-300 font-mono">{f.route || f.endpoint || '/api/v1/resource'}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={f.severity} />
                      <StatusBadge status={f.status} />
                      <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition">
                        Investigate <ChevronRight size={13} />
                      </span>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </PremiumCard>
      </motion.div>
    </div>
  );
}

// Interactive & Detailed Enterprise Severity Distribution Component
function SeverityDistributionSection({ pie, sev, activeTotal }) {
  const [hovered, setHovered] = useState(null);

  const colorMap = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: '#f59e0b',
    Low: '#10b981',
  };

  const slaMap = {
    Critical: '< 24h SLA',
    High: '< 48h SLA',
    Medium: '< 7d SLA',
    Low: 'Informational',
  };

  const activeItem = hovered ? {
    name: hovered,
    val: sev[hovered] || 0,
    pct: activeTotal > 0 ? Math.round(((sev[hovered] || 0) / activeTotal) * 100) : 0,
    color: colorMap[hovered] || '#0ea5e9'
  } : null;

  return (
    <PremiumCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase font-mono">
          <BarChart2 size={15} className="text-cyan-400" />
          Severity Distribution
        </h2>
        <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-300">
          {activeTotal} Total Cases
        </span>
      </div>

      {pie.every((p) => p.value === 0) ? (
        <EmptyState title="No findings yet" hint="Start an assessment to populate this chart." />
      ) : (
        <div className="space-y-4">
          <div className="grid items-center gap-6 sm:grid-cols-12">
            {/* Donut Chart with Dynamic Centered Display */}
            <div className="relative h-56 sm:col-span-5 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={74}
                    paddingAngle={4}
                    strokeWidth={0}
                    onMouseEnter={(data) => setHovered(data?.name)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {pie.map((entry) => {
                      const isHovered = hovered === entry.name;
                      return (
                        <Cell
                          key={entry.name}
                          fill={colorMap[entry.name] || '#64748b'}
                          opacity={hovered && !isHovered ? 0.45 : 1}
                          className="transition-all duration-200 cursor-pointer"
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      background: '#090d16',
                      border: '1px solid #1e293b',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                {activeItem ? (
                  <>
                    <span className="text-2xl font-bold tracking-tight" style={{ color: activeItem.color }}>
                      {activeItem.val}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mt-0.5">
                      {activeItem.name} ({activeItem.pct}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold tracking-tight text-white">{activeTotal}</span>
                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400">TOTAL CASES</span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Legend & Metadata Grid */}
            <div className="sm:col-span-7 space-y-2">
              {[
                { name: 'Critical', color: '#ef4444' },
                { name: 'High', color: '#f97316' },
                { name: 'Medium', color: '#f59e0b' },
                { name: 'Low', color: '#10b981' },
              ].map((item) => {
                const val = sev[item.name] || 0;
                const pct = activeTotal > 0 ? Math.round((val / activeTotal) * 100) : 0;
                const isSelected = hovered === item.name;

                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHovered(item.name)}
                    onMouseLeave={() => setHovered(null)}
                    className={`group flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-slate-600 bg-slate-800/90 shadow-sm'
                        : 'border-slate-800/80 bg-[#060a14] hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
                        {slaMap[item.name]}
                      </span>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <div className="text-right shrink-0 min-w-[45px]">
                        <span className="font-mono text-xs font-bold text-white">{val}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-1">({pct}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enterprise Risk Posture Strip */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center">
            <div className="rounded border border-slate-800/60 bg-[#060a14] p-1.5">
              <span className="block text-[9px] font-mono font-semibold uppercase text-slate-400">HIGHEST SEVERITY</span>
              <span className="block font-mono text-xs font-bold text-orange-400 mt-0.5">
                {sev.Critical > 0 ? 'CRITICAL' : sev.High > 0 ? 'HIGH' : 'MEDIUM'}
              </span>
            </div>
            <div className="rounded border border-slate-800/60 bg-[#060a14] p-1.5">
              <span className="block text-[9px] font-mono font-semibold uppercase text-slate-400">SLA COMPLIANCE</span>
              <span className="block font-mono text-xs font-bold text-emerald-400 mt-0.5">100% ON TIME</span>
            </div>
            <div className="rounded border border-slate-800/60 bg-[#060a14] p-1.5">
              <span className="block text-[9px] font-mono font-semibold uppercase text-slate-400">REMEDIATION STATUS</span>
              <span className="block font-mono text-xs font-bold text-cyan-400 mt-0.5">ACTIVE MONITORING</span>
            </div>
          </div>
        </div>
      )}
    </PremiumCard>
  );
}

// Clean Enterprise Stat Card with Sparkline
function StatCardWithSparkline({ label, value, badge, icon: Icon, stroke }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-3.5 shadow-sm transition hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{label}</span>
        {badge && (
          <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-300">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        <Icon size={15} className="text-slate-500" />
      </div>

      <svg className="mt-2 h-5 w-full opacity-50" viewBox="0 0 100 24">
        <path
          d="M 0 18 Q 20 8, 40 14 T 80 6 T 100 12"
          fill="none" stroke={stroke || "#0ea5e9"} strokeWidth="1.5" strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Enterprise Container Card
function PremiumCard({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md transition hover:border-slate-700/80 ${className}`}>
      {children}
    </div>
  );
}
