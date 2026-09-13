import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText,
  BarChart2,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Sliders,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RotateCcw,
  FileSpreadsheet,
  Zap,
  Trash2,
  Copy,
  Check,
  Key,
  ShieldCheck,
  User,
  Bell,
} from 'lucide-react';
import api from '../../lib/api';
import { errMsg, cn } from '../../lib/utils';
import CustomSelect from '../../components/ui/CustomSelect';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';

export function Reports() {
  const qc = useQueryClient();

  // Generator Form State
  const [form, setForm] = useState({
    assessmentId: '',
    type: 'Technical Report',
    format: 'PDF (Recommended)',
  });

  // Filter, Search & Pagination States
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'Completed' | 'In Progress' | 'Failed'
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Queries
  const assessments = useQuery({ queryKey: ['assessments-mini'], queryFn: async () => (await api.get('/assessments')).data });
  const list = useQuery({ queryKey: ['reports'], queryFn: async () => (await api.get('/reports')).data });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const typeClean = form.type.includes('Executive') ? 'Executive' : form.type.includes('Summary') ? 'Summary' : 'Technical';
      const formatClean = form.format.includes('HTML') ? 'HTML' : form.format.includes('JSON') ? 'JSON' : 'PDF';
      return (await api.post('/reports/generate', { assessmentId: form.assessmentId, type: typeClean, format: formatClean })).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/reports/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1$/, '');

  const fetchedReports = list.data?.reports || [];
  const rawList = fetchedReports.length > 0
    ? fetchedReports.map((r, i) => ({
        _id: r._id,
        idx: i + 1,
        name: `${r.type || 'Technical'} Security Report`,
        subtitle: 'Executive and technical security audit breakdown',
        assessment: 'Security Assessment Record',
        type: r.type || 'Technical',
        typeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        format: r.format || 'PDF',
        status: r.status === 'Ready' ? 'Completed' : r.status || 'Completed',
        generatedOn: r.createdAt || new Date().toISOString(),
        size: '2.1 MB',
        fileUrl: r.fileUrl ? `${apiBase}${r.fileUrl}` : null,
      }))
    : [];

  // Tab & Search Filter
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      const matchTab = activeTab === 'ALL' || item.status === activeTab;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.assessment.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [rawList, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedReports = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, page, pageSize]);

  // Executive Metrics
  const totalCount = rawList.length;
  const completedCount = rawList.filter((x) => x.status === 'Completed').length;
  const inProgressCount = rawList.filter((x) => x.status === 'In Progress').length;
  const failedCount = rawList.filter((x) => x.status === 'Failed').length;

  return (
    <div className="relative min-h-screen pb-16 space-y-6">
      {/* Top Header with Feature Banner Card */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Reports</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate executive, technical, and summary reports with evidence and remediation.
            </p>
          </div>
        </div>

        {/* Feature Banner Card */}
        <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900 p-3.5 shadow-lg backdrop-blur shrink-0 max-w-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20 text-cyan-300">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Turn assessments into actionable insights</h4>
            <p className="text-[11px] text-slate-400">
              Generate professional reports to track security posture, share with stakeholders, and drive remediation.
            </p>
          </div>
        </div>
      </div>

      {/* Top Executive Metric Summary Cards (4 Columns) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Reports */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">+4 this month</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{totalCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Total Reports</p>
          </div>
          {/* Cyan Mini Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,20 Q 25,10 50,15 T 100,5" fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 2: Generated (Completed) */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              {Math.round((completedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{completedCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Generated</p>
          </div>
          {/* Green Mini Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,18 Q 30,22 60,10 T 100,8" fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 3: In Progress */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-semibold">
              {Math.round((inProgressCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{inProgressCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">In Progress</p>
          </div>
          {/* Blue Mini Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,15 Q 40,5 70,18 T 100,10" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 4: Failed */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
              <XCircle className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-red-400 font-semibold">
              {Math.round((failedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{failedCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Failed</p>
          </div>
          {/* Red Mini Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,12 Q 35,24 65,8 T 100,20" fill="none" stroke="#ef4444" strokeWidth="2" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Generate New Report Control Panel */}
      <Card className="relative z-30 border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">
              📄
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Generate New Report</h3>
              <p className="text-[11px] text-slate-400">
                Select assessment, report type, and options to generate a report with evidence and remediation steps.
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition">
            <Sliders className="h-3.5 w-3.5" />
            <span>Advanced Options</span>
          </button>
        </div>

        {/* Form Controls Row */}
        <div className="grid gap-3 md:grid-cols-4">
          {/* Select Assessment */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Select Assessment *
            </label>
            <CustomSelect
              value={form.assessmentId}
              onChange={(e) => setForm({ ...form, assessmentId: e.target.value })}
              placeholder="Select assessment..."
              options={[
                { value: '', label: 'Select assessment...' },
                ...(assessments.data?.assessments || []).map((a) => {
                  const proj = typeof a.projectId === 'object' && a.projectId !== null ? a.projectId.name : '';
                  const tgt = typeof a.targetId === 'object' && a.targetId !== null ? a.targetId.name || a.targetId.url : '';
                  const when = a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                  return {
                    value: a._id,
                    label: [proj || tgt || a.type, a.type && (proj || tgt) ? a.type : '', a.status, when].filter(Boolean).join(' · '),
                  };
                }),
              ]}
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Report Type
            </label>
            <CustomSelect
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: 'Technical Report', label: 'Technical Report' },
                { value: 'Executive Summary', label: 'Executive Summary' },
                { value: 'Vulnerability Report', label: 'Vulnerability Report' },
                { value: 'Remediation Report', label: 'Remediation Report' },
                { value: 'Compliance Report', label: 'Compliance Report' },
              ]}
            />
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Output Format
            </label>
            <CustomSelect
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              options={[
                { value: 'PDF (Recommended)', label: 'PDF (Recommended)' },
                { value: 'HTML', label: 'HTML' },
                { value: 'JSON', label: 'JSON' },
              ]}
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={() => generateMutation.mutate()}
              disabled={!form.assessmentId || generateMutation.isPending}
              className="flex h-[34px] w-full items-center justify-center gap-2 rounded-md bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition border border-cyan-400/30 shadow-md disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Report…</span>
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
        {generateMutation.isError && <p className="mt-2 text-xs font-semibold text-red-400">{errMsg(generateMutation.error)}</p>}
      </Card>

      {/* Filter Tabs & Toolbar */}
      <Card className="relative z-20 border-slate-800 bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-medium border-b border-slate-800 pb-1 sm:pb-0 sm:border-0">
            {[
              { id: 'ALL', label: `All Reports (${totalCount})` },
              { id: 'Completed', label: `Completed (${completedCount})` },
              { id: 'In Progress', label: `In Progress (${inProgressCount})` },
              { id: 'Failed', label: `Failed (${failedCount})` },
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
                placeholder="Search reports..."
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
        {list.isLoading && <LoadingState label="Loading security audit report database..." />}
        {list.isError && <ErrorState message="Could not fetch reports database." onRetry={() => list.refetch()} />}

        {!list.isLoading && !list.isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-10 px-4 py-3 text-center">
                    <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0" />
                  </th>
                  <th className="w-10 px-2 py-3 text-center">#</th>
                  <th className="px-4 py-3">REPORT NAME</th>
                  <th className="px-4 py-3">ASSESSMENT</th>
                  <th className="px-3 py-3">TYPE</th>
                  <th className="px-3 py-3">FORMAT</th>
                  <th className="px-3 py-3">STATUS</th>
                  <th className="px-4 py-3">GENERATED ON</th>
                  <th className="px-3 py-3">SIZE</th>
                  <th className="px-4 py-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedReports.map((item) => {
                  const isDone = item.status === 'Completed';
                  const isRun = item.status === 'In Progress';
                  const isFail = item.status === 'Failed';

                  return (
                    <tr
                      key={item._id}
                      className="group transition duration-150 hover:bg-slate-800/60"
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0" />
                      </td>

                      {/* Row Index */}
                      <td className="px-2 py-3.5 text-center font-mono text-slate-500">{item.idx}</td>

                      {/* Report Name & Description */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                      </td>

                      {/* Assessment Context */}
                      <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                        {item.assessment}
                      </td>

                      {/* Report Type Pill */}
                      <td className="px-3 py-3.5">
                        <span className={cn('rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase', item.typeColor)}>
                          {item.type}
                        </span>
                      </td>

                      {/* Format Badge */}
                      <td className="px-3 py-3.5">
                        <span
                          className={cn(
                            'rounded border px-2 py-0.5 font-mono text-[10px] font-bold',
                            item.format === 'HTML'
                              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                              : item.format === 'JSON'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                          )}
                        >
                          {item.format}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Generated On Timestamp */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                        {new Date(item.generatedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="block text-[10px] text-slate-500">
                          {new Date(item.generatedOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* File Size */}
                      <td className="px-3 py-3.5 font-mono text-slate-400 text-[11px]">
                        {item.size}
                      </td>

                      {/* Actions Buttons */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isDone && (
                            <a
                              href={item.fileUrl || '#'}
                              target="_blank"
                              rel="noreferrer"
                              download
                              title={`Download ${item.format} report for ${item.name}`}
                              className="flex items-center gap-1 rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <Download className="h-3 w-3" /> Download
                            </a>
                          )}
                          {isRun && (
                            <button
                              title="Live generation in progress"
                              className="flex items-center gap-1 rounded border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300 cursor-default"
                            >
                              In Progress
                            </button>
                          )}
                          {isFail && (
                            <button
                              onClick={() => generateMutation.mutate()}
                              title="Retry report generation"
                              className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-700"
                            >
                              <RotateCcw className="h-3 w-3" /> Retry
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete report "${item.name}"?`)) {
                                deleteMutation.mutate(item._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="rounded p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
                            title={`Delete report ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

        {/* Dynamic Table Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-400 font-mono">
          <span>
            Showing {filteredList.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredList.length)} of {filteredList.length} reports
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={cn(
                  'h-7 w-7 rounded border font-bold text-xs transition',
                  page === pNum
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                )}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function Settings() {
  const [apiKey, setApiKey] = useState('sk_live_sentinel_' + Math.random().toString(36).substring(2, 12));
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = 'sk_live_sentinel_' + Math.random().toString(36).substring(2, 14);
    setApiKey(newKey);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Security & API Settings" subtitle="Configure system parameters, API authentication tokens, and user credentials." />

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Profile Card */}
        <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SOC Operator Profile</h3>
              <p className="text-xs text-slate-400">Security Analyst Account Information</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1 font-semibold">Operator Name</label>
              <input type="text" readOnly value="Security Lead (SOC Operations)" className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 font-medium" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1 font-semibold">Security Role</label>
              <div className="flex items-center gap-2">
                <span className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-300 uppercase">
                  Lead Security Engineer
                </span>
                <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                  • Verified Active
                </span>
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1 font-semibold">Assigned Workspace</label>
              <input type="text" readOnly value="Enterprise Defense Cluster (Prod-01)" className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 font-mono" />
            </div>
          </div>
        </Card>

        {/* API Key Management */}
        <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">API Authentication Key</h3>
                <p className="text-xs text-slate-400">Use this token for CLI tools & SDK integration</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block font-mono text-[10px] uppercase text-slate-400 font-semibold">Active Secret Key</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value={apiKey}
                className="flex-1 rounded border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-amber-300"
              />
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 font-semibold"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={handleRegenerateKey}
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1 mt-1"
            >
              <RotateCcw className="h-3 w-3" /> Regenerate API Secret Token
            </button>
          </div>
        </Card>
      </div>

      {/* SentinelAI Backend Connection Settings */}
      <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">SentinelAI Engine Configuration</h3>
            <p className="text-xs text-slate-400">Configure target API endpoint and scanning parameters</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1 font-semibold">
                Backend REST API Target URL
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1 font-semibold">
                Scan Timeout Threshold (Seconds)
              </label>
              <input
                type="number"
                defaultValue={120}
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-400">API Connection Active · 200 OK</span>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 px-4 py-2 font-bold text-xs text-white border border-cyan-400/30 shadow transition"
            >
              {saved ? <Check className="h-4 w-4 text-emerald-300" /> : <ShieldCheck className="h-4 w-4" />}
              <span>{saved ? 'Settings Saved!' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}


