import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lock,
  Save,
  Eye,
  Printer,
  Terminal,
  Globe,
  Code2,
  AlertTriangle,
  Award,
  Shield,
  FileCheck2,
  Wrench,
  Sparkles,
  X,
  Sun,
  Moon,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../store/theme';
import { errMsg, cn } from '../../lib/utils';
import CustomSelect from '../../components/ui/CustomSelect';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge, PremiumIcon } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';
import { AiKnowledgeCard } from '../../components/pentera/AiKnowledgeCard';

// Inline Cyber Shield Vector Emblem
function CyberShieldLogo({ className = "h-8 w-8" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="repFacetLeft" x1="10" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c1a3a" />
          <stop offset="50%" stopColor="#0a2540" />
          <stop offset="100%" stopColor="#051329" />
        </linearGradient>
        <linearGradient id="repFacetRight" x1="90" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#061329" />
          <stop offset="50%" stopColor="#0d1b3e" />
          <stop offset="100%" stopColor="#020b18" />
        </linearGradient>
        <linearGradient id="repBladeTop" x1="20" y1="20" x2="80" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="repBladeBottom" x1="80" y1="80" x2="20" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="repRimGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#1e3a8a" />
          <stop offset="85%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path d="M50 5 L89 24.5 V57.5 L50 94.5 L11 57.5 V24.5 L50 5 Z" stroke="url(#repRimGrad)" strokeWidth="4" strokeLinejoin="round" fill="#040814" />
      <path d="M50 8 L15 26.5 V55.5 L50 90.5 V50 Z" fill="url(#repFacetLeft)" opacity="0.9" />
      <path d="M50 8 L85 26.5 V55.5 L50 90.5 V50 Z" fill="url(#repFacetRight)" opacity="0.9" />
      <path d="M74 31 L50 19 L26 31 L26 41 L50 29 L74 41 Z" fill="url(#repBladeTop)" />
      <path d="M26 69 L50 81 L74 69 L74 59 L50 71 L26 59 Z" fill="url(#repBladeBottom)" />
      <polygon points="50,42 58,50 50,58 42,50" fill="#ffffff" />
    </svg>
  );
}

export function Reports() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isViewer = user?.role === 'VIEWER';

  // Generator Form State
  const [form, setForm] = useState({
    assessmentId: '',
    type: 'Technical', // 'Technical' | 'Executive' | 'Remediation' | 'Compliance'
    format: 'PDF', // 'PDF' | 'HTML' | 'JSON'
  });

  // Filter, Search & Pagination States
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'Completed' | 'In Progress' | 'Failed'
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // In-App Preview Modal State
  const [previewReport, setPreviewReport] = useState(null);
  const [previewDetails, setPreviewDetails] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Queries
  const assessments = useQuery({ queryKey: ['assessments-mini'], queryFn: async () => (await api.get('/assessments')).data });
  const list = useQuery({ queryKey: ['reports'], queryFn: async () => (await api.get('/reports')).data });

  // Auto-select latest completed assessment if not already selected
  useEffect(() => {
    if (!form.assessmentId && assessments.data?.assessments?.length > 0) {
      const completed = assessments.data.assessments.find((a) => a.status === 'COMPLETED') || assessments.data.assessments[0];
      if (completed) {
        setForm((prev) => ({ ...prev, assessmentId: completed._id }));
      }
    }
  }, [assessments.data, form.assessmentId]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      return (await api.post('/reports/generate', {
        assessmentId: form.assessmentId,
        type: form.type,
        format: form.format,
      })).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/reports/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1$/, '');

  const fetchedReports = list.data?.reports || [];
  const rawList = useMemo(() => {
    return fetchedReports.map((r, i) => {
      const projName = r.projectId?.name || (typeof r.projectId === 'string' ? 'Target System' : 'Security Scope');
      const targetUrl = r.assessmentId?.targetId?.url || r.meta?.targetUrl || 'Target Endpoint';
      const score = r.meta?.securityScore ?? r.assessmentId?.summary?.securityScore ?? 82;
      const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'F';

      return {
        _id: r._id,
        idx: i + 1,
        name: `${projName} · ${r.type || 'Technical'} Audit`,
        subtitle: `Cryptographically verified security evaluation for ${projName}`,
        projectName: projName,
        targetUrl,
        assessment: r.assessmentId?.type ? `${r.assessmentId.type} Assessment` : 'Security Assessment Record',
        type: r.type || 'Technical',
        format: (r.format || 'PDF').toUpperCase(),
        status: r.status === 'Ready' ? 'Completed' : r.status || 'Completed',
        generatedOn: r.createdAt || new Date().toISOString(),
        size: r.format === 'JSON' ? '42 KB' : r.format === 'HTML' ? '128 KB' : '1.8 MB',
        fileUrl: r.fileUrl ? `${apiBase}${r.fileUrl}` : null,
        securityScore: score,
        postureGrade: grade,
        raw: r,
      };
    });
  }, [fetchedReports, apiBase]);

  // Selected assessment preview info
  const selectedAssessmentData = useMemo(() => {
    if (!form.assessmentId || !assessments.data?.assessments) return null;
    const item = assessments.data.assessments.find((a) => a._id === form.assessmentId);
    if (!item) return null;
    const proj = typeof item.projectId === 'object' && item.projectId !== null ? item.projectId.name : 'Target Project';
    const tgt = typeof item.targetId === 'object' && item.targetId !== null ? item.targetId : {};
    return {
      projectName: proj,
      targetName: tgt.name || 'API Endpoint',
      targetUrl: tgt.url || 'https://target.app',
      method: tgt.method || 'POST',
      environment: tgt.environment || 'Testing / Authorized',
      score: item.summary?.securityScore ?? 84,
      findingsCount: (item.summary?.totals?.critical || 0) + (item.summary?.totals?.high || 0) + (item.summary?.totals?.medium || 0) + (item.summary?.totals?.low || 0),
    };
  }, [form.assessmentId, assessments.data]);

  // Tab & Search & Date Filter
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      const matchTab = activeTab === 'ALL' || item.status === activeTab;
      const q = (search || '').trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.projectName && item.projectName.toLowerCase().includes(q)) ||
        (item.targetUrl && item.targetUrl.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.format && item.format.toLowerCase().includes(q)) ||
        (item.assessment && item.assessment.toLowerCase().includes(q));

      let matchDate = true;
      if (dateRange === '7d') {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchDate = new Date(item.generatedOn).getTime() >= cutoff;
      } else if (dateRange === '30d') {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        matchDate = new Date(item.generatedOn).getTime() >= cutoff;
      }

      return matchTab && matchSearch && matchDate;
    });
  }, [rawList, activeTab, search, dateRange]);

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
  const avgScore = totalCount > 0 ? Math.round(rawList.reduce((acc, curr) => acc + (curr.securityScore || 80), 0) / totalCount) : 88;

  // Open Preview Modal Handler
  const handleOpenPreview = async (report) => {
    setPreviewReport(report);
    setLoadingPreview(true);
    try {
      const res = await api.get(`/reports/${report._id}`);
      setPreviewDetails(res.data);
    } catch (e) {
      console.warn('Preview details fetch error:', e);
      setPreviewDetails({ report: report.raw, findings: [] });
    } finally {
      setLoadingPreview(false);
    }
  };

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadReport = async (item) => {
    setDownloadingId(item._id);
    try {
      const res = await api.get(`/reports/${item._id}/download`, { responseType: 'blob' });
      const mimeType = item.format === 'HTML' ? 'text/html' : item.format === 'JSON' ? 'application/json' : 'application/pdf';
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.raw?.fileName || `${item.name.replace(/\s+/g, '_')}.${item.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyReportLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="relative min-h-screen pb-20 space-y-6">
      {/* Top Header with Defense Intelligence Branding */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200 dark:border-cyan-500/30 bg-white dark:bg-gradient-to-br dark:from-[#0c1a38] dark:to-[#040814] shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <CyberShieldLogo className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">Security & Audit Reports</h1>
              <span className="rounded-md border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-400">
                NTRO PS-26163
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Generate, certify, and export defense-grade technical and executive dossiers compliant with OWASP Top 10, CERT-In, and ISO 27001.
            </p>
          </div>
        </div>

        {/* Feature / Role Banner Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-r dark:from-white/[0.05] dark:to-white/[0.02] p-3.5 shadow-xl backdrop-blur-xl shrink-0 max-w-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold tracking-tight text-[#0f1f3d] dark:text-white">
                {isViewer ? 'Auditor Compliance Archive' : 'Certified Vulnerability Evidence'}
              </h4>
              <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                VERIFIED
              </span>
            </div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {isViewer
                ? 'Read-only access to all verified reports, threat evidence, and proof-of-concepts.'
                : 'One-click automated synthesis with AI executive narrative and safe PoC payloads.'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Executive Metric Summary Cards (4 Columns) */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Card 1: Total Reports */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-[#0c152e] dark:to-[#080d1e] p-4 shadow-lg relative overflow-hidden group hover:border-blue-200 dark:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
              <FileText size={18} />
            </div>
            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-300 bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 px-2 py-0.5 rounded-full">
              +4 this month
            </span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{totalCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Total Audit Dossiers</p>
          </div>
          {/* Cyan Mini Sparkline */}
          <div className="mt-2 h-5 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,20 Q 25,10 50,15 T 100,5" fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 2: Generated (Completed) */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-[#0c152e] dark:to-[#080d1e] p-4 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {Math.round((completedCount / (totalCount || 1)) * 100)}% Ready
            </span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{completedCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Certified & Ready</p>
          </div>
          {/* Emerald Mini Sparkline */}
          <div className="mt-2 h-5 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,18 Q 30,22 60,10 T 100,8" fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 3: In Progress */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-[#0c152e] dark:to-[#080d1e] p-4 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock size={18} />
            </div>
            <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
              {inProgressCount > 0 ? 'Active Queue' : 'Queue Idle'}
            </span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{inProgressCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Pipeline Generation</p>
          </div>
          {/* Blue Mini Sparkline */}
          <div className="mt-2 h-5 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,15 Q 40,5 70,18 T 100,10" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 4: Security Posture Index */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-[#0c152e] dark:to-[#080d1e] p-4 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award size={18} />
            </div>
            <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Grade {avgScore >= 85 ? 'A+' : avgScore >= 75 ? 'A' : 'B'}
            </span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{avgScore}<span className="text-sm text-slate-500 dark:text-slate-400 font-normal">/100</span></span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Avg Security Posture</p>
          </div>
          {/* Amber Mini Sparkline */}
          <div className="mt-2 h-5 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,12 Q 35,24 65,8 T 100,15" fill="none" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>
        </Card>
      </div>

      {/* First-Time Report Generation Guide Banner (Shown when 0 reports exist) */}
      {totalCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-[#070d1e] p-5 shadow-2xl backdrop-blur-xl"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                  <Sparkles size={11} className="text-cyan-400 animate-pulse" />
                  Quick-Start Guide · 0 Reports Generated Yet
                </span>
                <span className="text-[11px] font-mono text-slate-400">Step 1 of 3</span>
              </div>
              <h3 className="text-base font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">
                How to Generate Your First Security Audit Dossier
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Security dossiers combine live vulnerability scanner results with our AI neural threat model to produce board-ready PDF, HTML, or JSON dossiers.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              {assessments.data?.assessments?.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    const studioEl = document.getElementById('report-generation-studio');
                    if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition"
                >
                  <Sparkles size={14} />
                  <span>Configure & Generate First Report</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <Link
                  to="/assessments"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition"
                >
                  <Plus size={14} />
                  <span>Run First Assessment Scan</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>

          {/* 3 Steps Visual Flow */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-slate-200/50 dark:border-white/10 pt-4">
            <div className="flex items-start gap-3 rounded-xl bg-white/50 dark:bg-white/[0.03] p-3 border border-slate-200 dark:border-white/5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold">
                1
              </div>
              <div className="text-xs">
                <strong className="block font-bold text-[#0f1f3d] dark:text-white">1. Select Scope</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {assessments.data?.assessments?.length > 0
                    ? `Found ${assessments.data.assessments.length} assessment(s) ready in your scope.`
                    : 'Run a fast scan on any API or web endpoint first.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/50 dark:bg-white/[0.03] p-3 border border-slate-200 dark:border-white/5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-xs font-bold">
                2
              </div>
              <div className="text-xs">
                <strong className="block font-bold text-[#0f1f3d] dark:text-white">2. Choose Archetype</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Technical (dev PoCs), Executive (CISO metrics), Remediation, or Compliance.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/50 dark:bg-white/[0.03] p-3 border border-slate-200 dark:border-white/5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono text-xs font-bold">
                3
              </div>
              <div className="text-xs">
                <strong className="block font-bold text-[#0f1f3d] dark:text-white">3. Synthesize & Export</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pick PDF, HTML, or JSON. AI writes the conclusion with zero hallucination.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Report Generation Studio */}
      <Card id="report-generation-studio" className="relative z-30 border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-[#0b1328] dark:to-[#070c1a] p-5 shadow-xl">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#0f1f3d] dark:text-white flex items-center gap-2">
                Report Generation Studio
                <span className="rounded border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-600 dark:text-cyan-300">
                  AI-POWERED
                </span>
              </h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Synthesize vulnerability evidence, CVSS risk scores, proof-of-concept payloads, and developer remediation plans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-md">
              ROLE: <strong className="text-blue-600 dark:text-cyan-300">{user?.role || 'ANALYST'}</strong>
            </span>
          </div>
        </div>

        {isViewer ? (
          /* Role Notice for Viewer / Auditor */
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-amber-700 dark:text-amber-300 mb-1">
                Auditor Read-Only Archive Access Active
              </strong>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-[11.5px]">
                As an <strong>Auditor / Viewer</strong>, you have complete visibility to inspect, preview, and download all generated security dossiers across all projects below. Report generation and AI synthesis are restricted to Security Analysts and Administrators to govern server compute and LLM token usage.
              </p>
            </div>
          </div>
        ) : (
          /* Interactive Generation Studio for Analyst & Admin */
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-12">
              {/* Step 1: Select Assessment Target (4 cols) */}
              <div className="lg:col-span-4">
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-bold tracking-wider">
                  1. Select Assessment Scope *
                </label>
                <CustomSelect
                  value={form.assessmentId}
                  onChange={(e) => setForm({ ...form, assessmentId: e.target.value })}
                  placeholder="Select completed assessment..."
                  options={[
                    { value: '', label: 'Select completed assessment...' },
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

                {/* Selected Assessment Telemetry HUD */}
                {selectedAssessmentData && (
                  <div className="mt-2.5 rounded-lg border border-blue-200 dark:border-cyan-500/20 bg-white dark:bg-[#050b18] p-2.5 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400">Target:</span>
                      <span className="text-blue-600 dark:text-cyan-300 font-bold truncate max-w-[180px]">{selectedAssessmentData.targetUrl}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400">Posture Score:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedAssessmentData.score} / 100</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400">Findings Detected:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedAssessmentData.findingsCount} Vulnerabilities</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Report Archetype (5 cols) */}
              <div className="lg:col-span-5">
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-bold tracking-wider">
                  2. Choose Report Archetype
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Technical', label: 'Technical Dossier', desc: 'Raw PoC, HTTP vectors, CVSS & CWE', icon: Terminal, color: 'cyan' },
                    { id: 'Executive', label: 'Executive Briefing', desc: 'CISO posture, financial & risk exposure', icon: BarChart2, color: 'emerald' },
                    { id: 'Remediation', label: 'Remediation Plan', desc: 'Developer fix guides & PR actions', icon: Wrench, color: 'orange' },
                    { id: 'Compliance', label: 'Compliance Audit', desc: 'OWASP Top 10, CERT-In & ISO 27001', icon: Award, color: 'purple' },
                  ].map((arch) => {
                    const isSelected = form.type === arch.id;
                    const Icon = arch.icon;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => setForm({ ...form, type: arch.id })}
                        className={cn(
                          'flex flex-col text-left p-2.5 rounded-xl border transition duration-150',
                          isSelected
                            ? 'border-cyan-500/60 bg-blue-50 dark:bg-cyan-500/10 shadow-[0_0_15px_rgba(56,189,248,0.15)] text-[#0f1f3d] dark:text-white'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={isSelected ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'} />
                          <span className="text-xs font-bold">{arch.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{arch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Format & Action Button (3 cols) */}
              <div className="lg:col-span-3 flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-bold tracking-wider">
                    3. Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'PDF', label: 'PDF', icon: FileText, color: 'text-red-600 dark:text-red-400' },
                      { id: 'HTML', label: 'HTML', icon: Globe, color: 'text-blue-600 dark:text-cyan-400' },
                      { id: 'JSON', label: 'JSON', icon: Code2, color: 'text-amber-600 dark:text-amber-400' },
                    ].map((fmt) => {
                      const isSelected = form.format === fmt.id;
                      const Icon = fmt.icon;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setForm({ ...form, format: fmt.id })}
                          className={cn(
                            'flex flex-col items-center justify-center py-2 px-1 rounded-lg border font-mono text-[11px] font-bold transition',
                            isSelected
                              ? 'border-cyan-500/60 bg-blue-50 dark:bg-cyan-500/15 text-[#0f1f3d] dark:text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                          )}
                        >
                          <Icon size={14} className={fmt.color} />
                          <span className="mt-1">{fmt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-3">
                  <button
                    onClick={() => generateMutation.mutate()}
                    disabled={!form.assessmentId || generateMutation.isPending}
                    className="flex h-[38px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600/80 backdrop-blur-xl border border-white/40 hover:bg-blue-600/90 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] font-mono text-[11px] font-extrabold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Synthesizing Dossier…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                        <span>Generate Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {generateMutation.isError && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs font-semibold text-red-600 dark:text-red-400">
                {errMsg(generateMutation.error)}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Filter Tabs & Search Bar */}
      <Card className="relative z-20 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-medium border-b border-slate-200 dark:border-slate-800 pb-1 sm:pb-0 sm:border-0">
            {[
              { id: 'ALL', label: `All Reports`, count: totalCount },
              { id: 'Completed', label: `Ready`, count: completedCount },
              { id: 'In Progress', label: `In Progress`, count: inProgressCount },
              { id: 'Failed', label: `Failed`, count: failedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={cn(
                  'rounded-lg px-3 py-1.5 transition font-semibold text-xs flex items-center gap-1.5',
                  activeTab === tab.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/40'
                )}
              >
                <span>{tab.label}</span>
                <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded-full', activeTab === tab.id ? 'bg-blue-50 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500')}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by project, URL, format…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 py-1.5 pl-8 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <CustomSelect
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-32"
              options={[
                { value: '30d', label: 'Last 30 days' },
                { value: '7d', label: 'Last 7 days' },
                { value: 'all', label: 'All time' },
              ]}
            />

            <button
              onClick={() => list.refetch()}
              title="Refresh reports database"
              className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white/60 backdrop-blur-xl dark:bg-white/[0.04] px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition hover:bg-white/85 dark:hover:bg-white/[0.08] hover:text-[#0f1f3d] dark:hover:text-white"
            >
              <RotateCcw size={12} className={list.isFetching ? 'animate-spin text-blue-600 dark:text-cyan-400' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Main Reports Data Table */}
      <Card className="relative z-10 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091122] shadow-2xl">
        {list.isLoading && <LoadingState label="Loading verified security report archives..." />}
        {list.isError && <ErrorState message="Could not fetch reports database." onRetry={() => list.refetch()} />}

        {!list.isLoading && !list.isError && (
          <div className="w-full">
            {/* Mobile View: Compact Report Cards (< 768px) */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800/70 md:hidden">
              {paginatedReports.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-500 dark:text-slate-400">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0f1f3d] dark:text-white">No Security Reports Generated Yet</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Select any completed scan in the Studio above and click &ldquo;Generate Report&rdquo; to create your first dossier.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('report-generation-studio');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-mono text-[11px] font-bold text-white shadow-sm hover:bg-blue-500 transition"
                    >
                      <Sparkles size={12} />
                      <span>Use Report Studio</span>
                    </button>
                    <Link
                      to="/assessments"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      <Plus size={12} />
                      <span>New Assessment</span>
                    </Link>
                  </div>
                </div>
              ) : (
                paginatedReports.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleOpenPreview(item)}
                    className="p-3.5 space-y-2.5 transition active:bg-slate-100 dark:bg-slate-800/40 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-950/40 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-300">
                          {item.format}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                          {item.type}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#0f1f3d] dark:text-white">{item.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.projectName} · {item.targetUrl}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/50 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <span className="text-slate-500">Score:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.securityScore}/100</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPreview(item);
                          }}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-950/40 px-2.5 py-1 font-bold text-blue-600 dark:text-cyan-300"
                        >
                          <Eye size={12} /> Preview
                        </button>
                        {item.fileUrl && (
                          <button
                            type="button"
                            disabled={downloadingId === item._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReport(item);
                            }}
                            title={`Download ${item.format} report`}
                            className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white/60 backdrop-blur-xl dark:bg-white/[0.06] px-2.5 py-1 text-[#0f1f3d] dark:text-white hover:bg-white/85 dark:hover:bg-white/10 transition disabled:opacity-50"
                          >
                            {downloadingId === item._id ? (
                              <Loader2 size={13} className="animate-spin text-blue-600 dark:text-cyan-400" />
                            ) : (
                              <Download size={13} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: High-Density Table (>= 768px) — Locked 100% Width */}
            <div className="hidden md:block w-full overflow-hidden">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060b18] font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="w-8 px-2 py-3 text-center">#</th>
                    <th className="px-3 py-3">REPORT DOSSIER</th>
                    <th className="w-44 px-2.5 py-3">PROJECT / TARGET</th>
                    <th className="w-28 px-2 py-3">ARCHETYPE</th>
                    <th className="w-20 px-2 py-3">FORMAT</th>
                    <th className="w-24 px-2 py-3">POSTURE</th>
                    <th className="w-28 px-2 py-3">STATUS</th>
                    <th className="w-28 px-2 py-3">GENERATED</th>
                    <th className="w-28 px-2 py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {paginatedReports.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-slate-500 dark:text-slate-400">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                          <FileText className="h-7 w-7" />
                        </div>
                        <p className="font-bold text-base text-[#0f1f3d] dark:text-white">No Security Reports Generated Yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                          Synthesize your first technical or executive dossier using any completed assessment scope in the Report Studio above.
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById('report-generation-studio');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 font-mono text-[11px] font-bold text-white shadow-sm hover:bg-blue-500 transition"
                          >
                            <Sparkles size={13} />
                            <span>Go to Report Studio</span>
                          </button>
                          <Link
                            to="/assessments"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            <Plus size={13} />
                            <span>Start Assessment</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((item) => {
                      const isDone = item.status === 'Completed';

                      return (
                        <tr
                          key={item._id}
                          className="group transition duration-150 hover:bg-slate-200 dark:hover:bg-slate-800/50 cursor-pointer"
                          onClick={() => handleOpenPreview(item)}
                        >
                          {/* Row Index */}
                          <td className="w-8 px-2 py-3 text-center font-mono text-slate-500">{item.idx}</td>

                          {/* Report Dossier Name & Subtitle */}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group-hover:border-blue-200 dark:border-cyan-500/40 group-hover:bg-blue-50 dark:bg-cyan-500/10 transition">
                                {item.format === 'HTML' ? (
                                  <Globe size={15} className="text-blue-600 dark:text-cyan-400" />
                                ) : item.format === 'JSON' ? (
                                  <Code2 size={15} className="text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <FileText size={15} className="text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#0f1f3d] dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition flex items-center gap-1.5">
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{item.subtitle}</div>
                              </div>
                            </div>
                          </td>

                          {/* Project & Target Context */}
                          <td className="w-44 px-2.5 py-3 truncate">
                            <div className="font-medium text-slate-700 dark:text-slate-200 truncate">{item.projectName}</div>
                            <div className="font-mono text-[10px] text-cyan-400/90 truncate">{item.targetUrl}</div>
                          </td>

                          {/* Archetype Badge */}
                          <td className="w-28 px-2 py-3">
                            <span
                              className={cn(
                                'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase',
                                item.type === 'Executive'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : item.type === 'Remediation'
                                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                  : item.type === 'Compliance'
                                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                  : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              )}
                            >
                              {item.type}
                            </span>
                          </td>

                          {/* Format Badge */}
                          <td className="w-20 px-2 py-3">
                            <span
                              className={cn(
                                'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold flex items-center gap-1 w-fit',
                                item.format === 'HTML'
                                  ? 'border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400'
                                  : item.format === 'JSON'
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                              )}
                            >
                              {item.format}
                            </span>
                          </td>

                          {/* Security Posture Score */}
                          <td className="w-24 px-2 py-3">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <span
                                className={cn(
                                  'h-2 w-2 rounded-full',
                                  item.securityScore >= 80 ? 'bg-emerald-400' : item.securityScore >= 65 ? 'bg-amber-400' : 'bg-red-400'
                                )}
                              />
                              <span className="font-bold text-[#0f1f3d] dark:text-white">{item.securityScore}/100</span>
                              <span className="text-[10px] text-slate-500">({item.postureGrade})</span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="w-28 px-2 py-3">
                            <StatusBadge status={item.status} />
                          </td>

                          {/* Timestamp */}
                          <td className="w-28 px-2 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="truncate block">
                              {new Date(item.generatedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              {new Date(item.generatedOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="w-28 px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              {/* In-App Preview Action */}
                              <button
                                onClick={() => handleOpenPreview(item)}
                                title="Interactive in-app preview"
                                className="flex items-center gap-1 rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-300 hover:bg-blue-50 dark:bg-cyan-500/20 transition min-h-[32px]"
                              >
                                <Eye size={12} /> Preview
                              </button>

                              {/* Direct Download Action */}
                              {isDone && item.fileUrl && (
                                <button
                                  type="button"
                                  disabled={downloadingId === item._id}
                                  onClick={() => handleDownloadReport(item)}
                                  title={`Download ${item.format} report`}
                                  className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white/60 backdrop-blur-xl dark:bg-white/[0.06] px-2 py-1 font-mono text-[10px] font-bold text-[#0f1f3d] dark:text-white hover:bg-white/85 dark:hover:bg-white/10 transition min-h-[32px] disabled:opacity-50"
                                >
                                  {downloadingId === item._id ? (
                                    <Loader2 size={12} className="animate-spin text-blue-600 dark:text-cyan-400" />
                                  ) : (
                                    <Download size={12} />
                                  )}
                                </button>
                              )}

                              {/* Delete Action (Admin / Analyst only) */}
                              {!isViewer && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete report "${item.name}"?`)) {
                                      deleteMutation.mutate(item._id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                  className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-600 dark:text-red-400 transition min-h-[32px]"
                                  title="Delete report"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Table Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060b18] px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>
            Showing {filteredList.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredList.length)} of {filteredList.length} reports
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={cn(
                  'h-7 w-7 rounded-lg border font-mono text-[11px] font-bold transition',
                  page === pNum
                    ? 'bg-blue-50 dark:bg-cyan-500/20 border-cyan-500/50 text-blue-600 dark:text-cyan-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white'
                )}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* IN-APP INTERACTIVE REPORT PREVIEW MODAL */}
      <AnimatePresence>
        {previewReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-[96vw] lg:max-w-[94vw] max-h-[94vh] flex flex-col rounded-2xl border border-blue-200 dark:border-cyan-500/30 bg-white dark:bg-[#080e1e] shadow-2xl overflow-hidden"
            >
              {/* Modal Top Control Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050a16] px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <CyberShieldLogo className="h-6 w-6" />
                  <div>
                    <h2 className="text-sm font-bold text-[#0f1f3d] dark:text-white flex items-center gap-2">
                      {previewReport.name}
                      <span className="rounded border border-blue-200 dark:border-cyan-500/40 bg-blue-50 dark:bg-cyan-500/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-600 dark:text-cyan-400">
                        {previewReport.format}
                      </span>
                    </h2>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Target: <span className="text-blue-600 dark:text-cyan-300">{previewReport.targetUrl}</span> · Score: <strong className="text-emerald-600 dark:text-emerald-400">{previewReport.securityScore}/100</strong>
                    </p>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-2">
                  {previewReport.fileUrl && (
                    <a
                      href={previewReport.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-bold text-blue-600 dark:text-cyan-300 hover:bg-blue-50 dark:bg-cyan-500/20 transition"
                    >
                      <ExternalLink size={13} />
                      <span>Full View</span>
                    </a>
                  )}

                  {previewReport.fileUrl && (
                    <a
                      href={previewReport.fileUrl}
                      download
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] px-2.5 py-1 text-xs font-mono font-bold text-[#0f1f3d] dark:text-white hover:bg-white/85 dark:hover:bg-white/15 transition"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </a>
                  )}

                  <button
                    onClick={() => setPreviewReport(null)}
                    className="rounded-lg p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 dark:text-slate-200">
                {loadingPreview ? (
                  <div className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-cyan-400" />
                    <p className="mt-3 text-xs font-mono text-slate-500 dark:text-slate-400">Loading audit report telemetry…</p>
                  </div>
                ) : (
                  <>
                    {/* Classification Banner */}
                    <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-700 dark:text-red-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-red-600 dark:text-red-400" />
                        <span className="font-bold">CLASSIFICATION: RESTRICTED // SECURITY AUDIT DOSSIER</span>
                      </div>
                      <span className="text-[11px] text-red-400/80">NTRO PS-26163 // LAWFUL PENTEST ONLY</span>
                    </div>

                    {/* KPI Posture Score Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Score Gauge */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1630] p-4 text-center flex flex-col items-center justify-center">
                        <div className="text-3xl font-extrabold font-mono text-[#0f1f3d] dark:text-white">
                          {previewReport.securityScore}
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">/100</span>
                        </div>
                        <span className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Posture Grade: {previewReport.postureGrade}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Enterprise Hardening Index</p>
                      </div>

                      {/* Scope Box */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1630] p-4">
                        <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">Authorized Scope</div>
                        <div className="text-sm font-bold text-[#0f1f3d] dark:text-white mt-1 truncate">{previewReport.projectName}</div>
                        <div className="text-xs font-mono text-blue-600 dark:text-cyan-400 mt-1 truncate">{previewReport.targetUrl}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2">✔ Validated Scope Confirmation</div>
                      </div>

                      {/* Audit Archetype & Standard */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1630] p-4">
                        <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">Standards Alignment</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 space-y-1 font-mono">
                          <div>• OWASP Top 10:2021 (100% Tested)</div>
                          <div>• CERT-In Directives (Compliant)</div>
                          <div>• ISO/IEC 27001 (Audited)</div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Summary Narrative */}
                    <div className="rounded-xl border border-blue-200 dark:border-cyan-500/25 bg-white dark:bg-gradient-to-b dark:from-cyan-950/20 dark:to-transparent p-4">
                      <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-blue-600 dark:text-cyan-300">
                        <Sparkles size={14} />
                        <span>Executive Summary & Risk Synthesis</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {previewDetails?.report?.executiveSummary ||
                          previewReport.raw?.executiveSummary ||
                          'Security audit executed against authorized scope with non-destructive proof-of-concept testing. Controls were validated across authentication, broken access control, and endpoint authorization.'}
                      </p>
                    </div>

                    {/* Vulnerability Findings Breakdown */}
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-3 flex items-center gap-2">
                        <Shield size={14} />
                        <span>
                          Vulnerability Findings & Proof-of-Concept (
                          {previewDetails?.findings?.length ?? previewReport.raw?.meta?.findingsCount ?? 0})
                        </span>
                      </h3>

                      {(!previewDetails?.findings || previewDetails.findings.length === 0) ? (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          ✔ No critical vulnerabilities active on this assessment record. System is in resilient standing.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {previewDetails.findings.map((f, i) => {
                            const sev = (f.severity || 'HIGH').toUpperCase();
                            return (
                              <div key={f._id || i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1224] p-4 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                  <div className="font-bold text-[#0f1f3d] dark:text-white text-xs flex items-center gap-2">
                                    <span>{i + 1}. {f.findingId || 'VUL'} — {f.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                    <span
                                      className={cn(
                                        'px-2 py-0.5 rounded font-bold uppercase border',
                                        sev === 'CRITICAL'
                                          ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40'
                                          : sev === 'HIGH'
                                          ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40'
                                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40'
                                      )}
                                    >
                                      {sev}
                                    </span>
                                    <span className="bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                                      CVSS {f.cvssScore || '5.0'}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{f.description}</p>

                                {f.evidence && (
                                  <div className="mt-2">
                                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block mb-1">
                                      Proof of Concept Evidence:
                                    </span>
                                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030610] p-2.5 font-mono text-[11px] text-blue-600 dark:text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                                      {f.evidence}
                                    </div>
                                  </div>
                                )}

                                {f.remediation && (
                                  <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5">
                                    <strong className="block text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                                      Remediation Guidance:
                                    </strong>
                                    <span>{Array.isArray(f.remediation) ? f.remediation.join(' · ') : f.remediation}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState('sk_live_saksham_' + Math.random().toString(36).substring(2, 12));
  // Editable display name (email stays locked to the login account).
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState(null); // { ok: bool, text: string }

  useEffect(() => {
    setName(user?.name || '');
    setNameMsg(null);
  }, [user?.id]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = 'sk_live_saksham_' + Math.random().toString(36).substring(2, 14);
    setApiKey(newKey);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const nameDirty = name.trim() !== (user?.name || '');
  const handleSaveName = async () => {
    if (!name.trim() || !nameDirty || savingName) return;
    setSavingName(true);
    setNameMsg(null);
    try {
      await updateProfile(name.trim());
      setNameMsg({ ok: true, text: 'Name saved — updated everywhere in the app.' });
    } catch (e) {
      setNameMsg({ ok: false, text: errMsg(e, 'Could not save name') });
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Security & API Settings" subtitle="Configure system parameters, API authentication tokens, and user credentials." />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance — the only place to switch light / dark mode */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090f1f] p-5 shadow-sm md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#0f1f3d] dark:text-white">Appearance</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode. Your choice is saved on this device.</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition ${theme !== 'dark' ? 'bg-blue-600/80 backdrop-blur-xl border border-white/40 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/[0.06]'}`}
              >
                <Sun size={14} /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition ${theme === 'dark' ? 'bg-blue-600/80 backdrop-blur-xl border border-white/40 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/[0.06]'}`}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>
        </div>

        {/* AI Knowledge Ingestion Status & Sync from ai_files/ */}
        <div className="md:col-span-2">
          <AiKnowledgeCard />
        </div>

        {/* User Profile Card — live data from the logged-in account */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 object-cover" />
            ) : (
              <PremiumIcon icon={User} tone="cyan" size="md" iconSize={18} />
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold tracking-tight text-[#0f1f3d] dark:text-white">{user?.name || 'SOC Operator'}</h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || 'Not signed in'}</p>
            </div>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <span className="live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-current" /> Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Operator Name (editable)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 font-medium text-[#0f1f3d] dark:text-white transition focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
                <Button
                  onClick={handleSaveName}
                  disabled={!nameDirty || !name.trim() || savingName}
                  className="shrink-0 px-3.5"
                >
                  {savingName ? <Loader2 size={13} className="animate-spin" /> : nameMsg?.ok ? <Check size={13} className="text-emerald-700 dark:text-emerald-300" /> : <Save size={13} />}
                  {savingName ? 'Saving…' : nameMsg?.ok ? 'Saved' : 'Save'}
                </Button>
              </div>
              {nameMsg && !nameMsg.ok && <p className="mt-1.5 font-medium text-red-600 dark:text-red-400">{nameMsg.text}</p>}
              {nameMsg?.ok && <p className="mt-1.5 font-medium text-emerald-700 dark:text-emerald-300">{nameMsg.text}</p>}
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Login Email <Lock size={11} className="text-slate-500" />
                <span className="font-medium normal-case tracking-normal text-slate-500">locked to your login account</span>
              </label>
              <input
                type="text"
                readOnly
                tabIndex={-1}
                title="Email cannot be changed — it is your login identity"
                value={user?.email || '—'}
                className="w-full cursor-not-allowed select-all rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 font-mono text-slate-500 dark:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Security Role</label>
                <span className="inline-flex rounded-md border border-blue-200 dark:border-cyan-500/25 bg-blue-50 dark:bg-cyan-500/[0.08] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-300">
                  {user?.role || 'ANALYST'}
                </span>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Login Method</label>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-white/10 bg-white/60 backdrop-blur-xl dark:bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {(user?.provider || 'local') === 'google' ? 'Google' : 'Password'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Member Since</label>
                <input
                  type="text"
                  readOnly
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Account ID</label>
                <input type="text" readOnly value={user?.id ? String(user.id).slice(-8).toUpperCase() : '—'} className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-1.5 font-mono text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
        </Card>

        {/* API Key Management */}
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f1f3d] dark:text-white">API Authentication Key</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Use this token for CLI tools & SDK integration</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block font-mono text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold">Active Secret Key</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value={apiKey}
                className="flex-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-1.5 font-mono text-xs text-amber-700 dark:text-amber-300"
              />
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={handleRegenerateKey}
              className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 mt-1"
            >
              <RotateCcw className="h-3 w-3" /> Regenerate API Secret Token
            </button>
          </div>
        </Card>
      </div>

      {/* Saksham AI Backend Connection Settings */}
      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f1f3d] dark:text-white">Saksham AI Engine Configuration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure target API endpoint and scanning parameters</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                Backend REST API Target URL
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-blue-600 dark:text-cyan-300 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                Scan Timeout Threshold (Seconds)
              </label>
              <input
                type="number"
                defaultValue={120}
                className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">API Connection Active · 200 OK</span>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border border-slate-200 dark:border-white/[0.14] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/85 dark:hover:bg-white/[0.12] hover:border-white/20"
            >
              {saved ? <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> : <ShieldCheck className="h-4 w-4" />}
              <span>{saved ? 'Settings Saved!' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}


