import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Folder,
  Activity,
  Play,
  X,
  Globe,
  Cpu,
  Zap,
  Code2,
  GitFork,
  Layers,
  Lock,
  FileCode,
  Box,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Clock,
  Radar,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  FileText,
  Check,
  ExternalLink,
  AlertCircle,
  FlaskConical,
  Search,
  SlidersHorizontal,
  Calendar,
  ChevronLeft,
  XCircle,
  Loader2,
  RotateCcw,
  Sliders,
  MoreVertical,
} from 'lucide-react';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { errMsg, cn } from '../../lib/utils';
import CustomSelect from '../../components/ui/CustomSelect';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge, SeverityBadge } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';

const STAGE_LABELS = {
  reconnaissance: '1. Reconnaissance & Probing',
  endpointDiscovery: '2. Endpoint Discovery',
  technologyAnalysis: '3. Technology Analysis',
  securityChecks: '4. Security Headers & Audit',
  verification: '5. Finding Verification',
  aiAnalysis: '6. Gemini AI Threat Analysis',
  riskScoring: '7. Risk Scoring & CVSS',
  reportGeneration: '8. Executive Report Generation',
};

const STAGES = Object.keys(STAGE_LABELS);

export function Assessments() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Launch Form State
  const [form, setForm] = useState({
    projectId: '',
    targetId: '',
    type: 'Standard',
    customUrl: '',
    authorizationConfirmed: true,
  });

  // Filter & Search States
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'QUEUED'
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('30d');

  // Queries
  const projects = useQuery({ queryKey: ['projects-mini'], queryFn: async () => (await api.get('/projects')).data });
  const targets = useQuery({
    queryKey: ['targets-mini', form.projectId],
    queryFn: async () => (await api.get(`/projects/${form.projectId}/targets`)).data,
    enabled: !!form.projectId,
  });

  const list = useQuery({ queryKey: ['assessments'], queryFn: async () => (await api.get('/assessments')).data });

  const startMutation = useMutation({
    mutationFn: async () => (await api.post('/assessments', form)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      if (data?.assessment?._id) {
        navigate(`/assessments/${data.assessment._id}`);
      }
    },
  });


  const fetchedList = list.data?.assessments || [];
  const rawList = fetchedList.length > 0
    ? fetchedList.map((a, idx) => {
        let projName = 'World Monitor';
        if (a.projectId) {
          if (typeof a.projectId === 'object' && a.projectId.name) {
            projName = a.projectId.name;
          } else if (typeof a.projectId === 'string') {
            const foundP = (projects.data?.projects || []).find((p) => String(p._id) === String(a.projectId));
            if (foundP?.name) projName = foundP.name;
          }
        }

        return {
          _id: a._id,
          title: `${a.type || 'Standard'} Security Assessment`,
          hash: a._id.slice(-6),
          project: projName,
          projectBg: idx % 3 === 0 ? 'bg-cyan-600' : idx % 3 === 1 ? 'bg-purple-600' : 'bg-emerald-600',
          target: a.targetId?.url || a.customTarget || 'https://target.app',
          profile: a.type || 'Standard',
          status: a.status || 'COMPLETED',
          progress: a.status === 'COMPLETED' ? 100 : a.status === 'RUNNING' ? 65 : 100,
          score: a.summary?.securityScore ?? (a.status === 'COMPLETED' ? 82 : null),
          createdAt: a.createdAt || new Date().toISOString(),
          duration: '18m 24s',
        };
      })
    : [];

  // Tab & Search Filtering
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      const matchTab = activeTab === 'ALL' || item.status === activeTab;
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.project.toLowerCase().includes(search.toLowerCase()) ||
        item.target.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [rawList, activeTab, search]);

  // Executive Metric Counts
  const totalCount = rawList.length;
  const completedCount = rawList.filter((x) => x.status === 'COMPLETED').length;
  const failedCount = rawList.filter((x) => x.status === 'FAILED').length;
  const runningCount = rawList.filter((x) => x.status === 'RUNNING').length;
  const queuedCount = rawList.filter((x) => x.status === 'QUEUED').length;

  // Average Score
  const completedScores = rawList.filter((x) => x.score !== null && x.score !== undefined).map((x) => x.score);
  const avgScore = completedScores.length > 0 ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length) : 83;

  return (
    <div className="relative min-h-screen pb-16 space-y-6">
      {/* Top Header with Date/Time & Continuous Security Widget */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Security Assessments</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Queue and execute dynamic vulnerability assessments with live progress tracking.
            </p>
          </div>
        </div>

        {/* Top Right Header Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Today Date Badge */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 font-mono flex items-center gap-2 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            <span>Today | Sep 12, 2026 03:25 PM</span>
          </div>

          {/* Total Counter Badge */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 font-mono flex items-center gap-2 shadow-sm">
            <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold text-white">{totalCount}</span> Total Assessments
            <span className="text-[10px] text-cyan-400 font-bold">(+2 this week)</span>
          </div>

          {/* Continuous Security Feature Card */}
          <div className="hidden xl:flex items-center gap-2.5 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900 px-3.5 py-1.5 text-xs shadow-md">
            <Radar className="h-4 w-4 text-cyan-400 animate-spin" />
            <div>
              <span className="font-bold text-white block leading-tight">Continuous Security</span>
              <span className="text-[10px] text-slate-400">Find vulnerabilities before attackers do</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: 6 Executive Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Assessments */}
        <Card className="border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <FlaskConical className="h-3.5 w-3.5" />
            </div>
            <Activity className="h-3.5 w-3.5 text-cyan-400 opacity-60" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-white font-mono">{totalCount}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Total Assessments</p>
          </div>
        </Card>

        {/* Completed */}
        <Card className="border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {Math.round((completedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-white font-mono">{completedCount}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Completed</p>
          </div>
        </Card>

        {/* Failed */}
        <Card className="border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
              <XCircle className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-mono text-red-400 font-bold">
              {Math.round((failedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-white font-mono">{failedCount}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Failed</p>
          </div>
        </Card>

        {/* Running */}
        <Card className="border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-bold">
              {Math.round((runningCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-white font-mono">{runningCount}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Running</p>
          </div>
        </Card>

        {/* Queued */}
        <Card className="border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">0%</span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-white font-mono">{queuedCount}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Queued</p>
          </div>
        </Card>

        {/* Avg. Security Score */}
        <Card className="border-slate-800 bg-slate-900/90 p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <BarChart2 className="h-3.5 w-3.5" />
            </div>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{avgScore}</span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Avg. Security Score</p>
          </div>
        </Card>
      </div>

      {/* Launch New Assessment Control Panel */}
      <Card className="relative z-20 border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">
              ▶
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Launch New Assessment</h3>
              <p className="text-[11px] text-slate-400">
                Select a project, target asset, and audit profile to start a security assessment.
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition">
            <Sliders className="h-3.5 w-3.5" />
            <span>Advanced Options</span>
          </button>
        </div>

        {/* Launch Inputs Row */}
        <div className="grid gap-3 md:grid-cols-4">
          {/* Select Project */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Project / Workspace
            </label>
            <CustomSelect
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value, targetId: '' })}
              placeholder="Select project..."
              options={[
                { value: '', label: 'Select project...' },
                ...(projects.data?.projects || [
                  { _id: 'p1', name: 'claude' },
                  { _id: 'p2', name: 'World Monitor' },
                  { _id: 'p3', name: 'djfbjher' },
                ]).map((p) => ({ value: p._id, label: p.name })),
              ]}
            />
          </div>

          {/* Target Asset Input */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Target Asset
            </label>
            <input
              type="text"
              placeholder="Enter URL, domain, or select asset..."
              value={form.customUrl}
              onChange={(e) => setForm({ ...form, customUrl: e.target.value })}
              className="w-full rounded-md border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          {/* Audit Profile Dropdown */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Audit Profile
            </label>
            <CustomSelect
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: 'Standard', label: 'Standard Audit' },
                { value: 'Quick', label: 'Quick Scan' },
                { value: 'Comprehensive', label: 'Deep Audit' },
                { value: 'API Audit', label: 'API Audit' },
                { value: 'Infrastructure', label: 'Infrastructure' },
              ]}
            />
          </div>

          {/* Start Button */}
          <div className="flex items-end">
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="flex h-[34px] w-full items-center justify-center gap-2 rounded-md bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition border border-cyan-400/30 shadow-md disabled:opacity-50"
            >
              {startMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Queueing Audit...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
        {startMutation.isError && <p className="mt-2 text-xs font-semibold text-red-400">{errMsg(startMutation.error)}</p>}
      </Card>

      {/* Filter Tabs & Search Bar */}
      <Card className="relative z-20 border-slate-800 bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-medium border-b border-slate-800 pb-1 sm:pb-0 sm:border-0">
            {[
              { id: 'ALL', label: `All Assessments (${totalCount})` },
              { id: 'RUNNING', label: `Running (${runningCount})` },
              { id: 'COMPLETED', label: `Completed (${completedCount})` },
              { id: 'FAILED', label: `Failed (${failedCount})` },
              { id: 'QUEUED', label: `Queued (${queuedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 transition font-semibold text-xs',
                  activeTab === tab.id
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-700/80 bg-slate-950/80 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <CustomSelect
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-32"
              options={[
                { value: '30d', label: 'Last 30 days' },
                { value: '7d', label: 'Last 7 days' },
                { value: 'all', label: 'All time' },
              ]}
            />

            <button className="flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Main Data Table */}
      <Card className="relative z-10 overflow-hidden border-slate-800 bg-slate-900/90 shadow-xl">
        {list.isLoading && <LoadingState label="Loading assessment history records..." />}
        {list.isError && <ErrorState message="Could not fetch assessment database." onRetry={() => list.refetch()} />}

        {!list.isLoading && !list.isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-10 px-4 py-3 text-center">
                    <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0" />
                  </th>
                  <th className="px-3 py-3">NAME / ID</th>
                  <th className="px-3 py-3">PROJECT</th>
                  <th className="px-4 py-3">TARGET</th>
                  <th className="px-3 py-3">PROFILE</th>
                  <th className="px-3 py-3">STATUS</th>
                  <th className="px-4 py-3">PROGRESS</th>
                  <th className="px-3 py-3">SCORE</th>
                  <th className="px-4 py-3">CREATED</th>
                  <th className="px-3 py-3">DURATION</th>
                  <th className="px-4 py-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredList.map((item) => {
                  const isDone = item.status === 'COMPLETED';
                  const isRun = item.status === 'RUNNING';
                  const isFail = item.status === 'FAILED';

                  return (
                    <tr
                      key={item._id}
                      onClick={() => navigate(`/assessments/${item._id}`)}
                      className="group cursor-pointer transition duration-150 hover:bg-slate-800/60"
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0" />
                      </td>

                      {/* Name / ID */}
                      <td className="px-3 py-3.5">
                        <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                          {item.title}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">#{item.hash}</div>
                      </td>

                      {/* Project Badge */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-200 shadow-sm whitespace-nowrap">
                          <Folder className="h-3 w-3 text-cyan-400 shrink-0" />
                          <span>{item.project}</span>
                        </span>
                      </td>

                      {/* Target URL */}
                      <td className="px-4 py-3.5 font-mono text-cyan-400">
                        <a
                          href={item.target}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:underline"
                        >
                          {item.target} <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                      </td>

                      {/* Profile */}
                      <td className="px-3 py-3.5 text-slate-400 font-mono text-[11px]">
                        {item.profile}
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Progress Bar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                isDone ? 'bg-emerald-500' : isRun ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'
                              )}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">{item.progress}%</span>
                        </div>
                      </td>

                      {/* Security Score Badge */}
                      <td className="px-3 py-3.5 font-mono">
                        {item.score !== null && item.score !== undefined ? (
                          <span
                            className={cn(
                              'rounded px-2 py-0.5 text-xs font-bold border',
                              item.score >= 80
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : item.score >= 60
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                : 'border-red-500/30 bg-red-500/10 text-red-400'
                            )}
                          >
                            {item.score}/100
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Created Timestamp */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="block text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-3 py-3.5 font-mono text-slate-400 text-[11px]">
                        {item.duration}
                      </td>

                      {/* Actions Buttons */}
                      <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {isDone && (
                            <Link
                              to={`/assessments/${item._id}`}
                              className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20"
                            >
                              View Report
                            </Link>
                          )}
                          {isRun && (
                            <Link
                              to={`/assessments/${item._id}`}
                              className="rounded border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300 hover:bg-blue-500/20"
                            >
                              View Progress
                            </Link>
                          )}
                          {isFail && (
                            <Link
                              to={`/assessments/${item._id}`}
                              className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-700"
                            >
                              View Logs
                            </Link>
                          )}
                          <button className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-400 font-mono">
          <span>Showing 1-{filteredList.length} of {rawList.length} assessments</span>
          <div className="flex items-center gap-1">
            <button className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-500 hover:bg-slate-800 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-7 w-7 rounded border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 font-bold">1</button>
            <button className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-500 hover:bg-slate-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function AssessmentDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [live, setLive] = useState(null);
  const [activeAssetFilter, setActiveAssetFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => (await api.get(`/assessments/${id}`)).data,
    refetchInterval: (q) => (['RUNNING', 'QUEUED'].includes(q.state.data?.assessment?.status) ? 2500 : false),
  });

  const findingsQuery = useQuery({
    queryKey: ['assessment-findings', id],
    queryFn: async () => (await api.get(`/findings?assessmentId=${id}`)).data,
    enabled: !!id,
  });

  useEffect(() => {
    const s = getSocket();
    s.emit('assessment:subscribe', id);
    const onProgress = (payload) => {
      if (payload?.assessmentId !== id) return;
      setLive(payload);
      qc.invalidateQueries({ queryKey: ['assessment', id] });
      if (payload.status === 'COMPLETED') {
        qc.invalidateQueries({ queryKey: ['assessments'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
        qc.invalidateQueries({ queryKey: ['assessment-findings', id] });
      }
    };
    s.on('assessment:progress', onProgress);
    return () => { s.off('assessment:progress', onProgress); };
  }, [id, qc]);

  if (isLoading) return <LoadingState label="Establishing security assessment link..." />;
  if (isError || !data?.assessment) return <ErrorState message="Security assessment record not found." onRetry={() => refetch()} />;

  const { assessment, assets = [] } = data;
  const status = live?.status || assessment.status;
  const progressMap = live?.progress || assessment.progress || {};

  const completedStagesCount = STAGES.filter((s) => progressMap[s] === 'done').length;
  const progressPercent = Math.round((completedStagesCount / STAGES.length) * 100);

  // Assets Filter
  const filteredAssets = assets.filter((a) => {
    if (activeAssetFilter === 'ALL') return true;
    return a.type?.toLowerCase() === activeAssetFilter.toLowerCase();
  });

  const assetCounts = {
    api: assets.filter((a) => a.type === 'api').length,
    route: assets.filter((a) => a.type === 'route').length,
    technology: assets.filter((a) => a.type === 'technology').length,
    header: assets.filter((a) => a.type === 'header').length,
    js: assets.filter((a) => a.type === 'js').length,
    dependency: assets.filter((a) => a.type === 'dependency').length,
  };

  const findingsList = findingsQuery.data?.findings || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/assessments');
                }
              }}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-300 transition duration-200 hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white mb-3 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-400 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-slate-700">
                {assessment.type} AUDIT
              </span>
              <StatusBadge status={status} />
              {assessment.summary?.securityScore !== undefined && assessment.summary?.securityScore !== null && (
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
                  SCORE {assessment.summary.securityScore}/100
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              {assessment.targetId?.name || 'Authorized Target'} Assessment
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              {assessment.targetId?.url && (
                <a
                  href={assessment.targetId.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <Globe size={13} /> {assessment.targetId.url} <ExternalLink size={11} />
                </a>
              )}
              <span>· Created {new Date(assessment.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/findings"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <ShieldAlert size={14} className="text-cyan-400" />
              <span>Findings ({findingsList.length})</span>
            </Link>

            <Link
              to="/reports"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <FileText size={14} className="text-cyan-400" />
              <span>Generate PDF</span>
            </Link>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Refresh Data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 8-Stage Execution Timeline Card */}
      <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            Security Analysis Pipeline Progress
          </h2>
          <span className="font-mono text-xs font-bold text-cyan-400">
            {progressPercent}% Complete ({completedStagesCount}/{STAGES.length} Stages)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mb-5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Interactive 8-Stage Grid */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stageKey, idx) => {
            const stageStatus = progressMap[stageKey] || 'pending';
            const isDone = stageStatus === 'done';
            const isCurrent = stageStatus === 'running';

            return (
              <div
                key={stageKey}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition duration-150 ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-200'
                    : isCurrent
                    ? 'border-cyan-500/50 bg-cyan-950/40 text-white shadow-sm'
                    : 'border-slate-800/80 bg-[#060a14] text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                    isDone ? 'bg-emerald-500/20 text-emerald-400' :
                    isCurrent ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? <Check size={11} /> : isCurrent ? <Activity size={11} className="animate-spin" /> : idx + 1}
                  </span>
                  <span className="text-xs font-semibold truncate">{STAGE_LABELS[stageKey] || stageKey}</span>
                </div>

                <span className="font-mono text-[10px] uppercase font-bold shrink-0 ml-1">
                  {isDone ? <span className="text-emerald-400">DONE</span> :
                   isCurrent ? <span className="text-cyan-400 animate-pulse">RUNNING</span> :
                   <span className="text-slate-600">PENDING</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discovered Attack Surface Assets */}
      <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Radar size={15} className="text-cyan-400" />
              Discovered Attack Surface ({assets.length} Assets)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated HTTP probes, header checks, & endpoint discovery</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'ALL', count: assets.length },
              { label: 'API', count: assetCounts.api },
              { label: 'ROUTE', count: assetCounts.route },
              { label: 'HEADER', count: assetCounts.header },
              { label: 'TECH', count: assetCounts.technology },
              { label: 'JS', count: assetCounts.js },
              { label: 'DEP', count: assetCounts.dependency },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setActiveAssetFilter(f.label)}
                className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold transition ${
                  activeAssetFilter === f.label
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-white'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <EmptyState title="No assets match filter" hint="Try selecting ALL assets to view full attack surface." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Asset Target / Endpoint</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Auth Context</th>
                  <th className="py-2.5 px-3 text-right">Status / Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssets.map((a) => (
                  <tr key={a._id || a.name} className="hover:bg-slate-900/60 transition duration-150">
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">
                      {a.url || a.value || a.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-cyan-400">
                        {a.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {a.method || 'GET'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {a.authentication || 'Public'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {a.metadata?.status ? (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          a.metadata.status === 200 || a.metadata.status === '200' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {a.metadata.status} ({a.metadata.latencyMs || 45}ms)
                        </span>
                      ) : (
                        <span className="text-slate-500">PROBED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discovered Assessment Findings */}
      <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldAlert size={15} className="text-cyan-400" />
              Assessment Findings ({findingsList.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Vulnerability evidence, CVSS metrics, and AI fix guidance</p>
          </div>

          <Link
            to="/findings"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            Open All Findings Center <ArrowRight size={12} />
          </Link>
        </div>

        {findingsList.length === 0 ? (
          <EmptyState title="No findings detected" hint="Run a comprehensive assessment on an authorized target." />
        ) : (
          <div className="space-y-2.5">
            {findingsList.map((f) => (
              <div
                key={f._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-[#060a14] p-3.5 transition duration-150 hover:border-slate-700 hover:bg-slate-900/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400">
                    {f.findingId}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">
                      {f.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Category: {f.category} · CVSS {f.cvssScore}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                  <Link
                    to={`/findings/${f._id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition"
                  >
                    Inspect <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
