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
  Terminal,
  Key,
  Sparkles,
  Plus,
  Copy,
  Download,
} from 'lucide-react';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { errMsg, cn, parseCurlCommand } from '../../lib/utils';
import CustomSelect from '../../components/ui/CustomSelect';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge, SeverityBadge, PremiumIcon } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';
import { PenteraAttackMap } from '../../components/pentera/PenteraAttackMap';

const STAGE_LABELS = {
  reconnaissance: '1. Reconnaissance & Security Scanning',
  endpointDiscovery: '2. Endpoint Discovery',
  technologyAnalysis: '3. Technology Analysis',
  securityChecks: '4. Security Headers & Audit',
  verification: '5. Finding Verification',
  aiAnalysis: '6. Automated Vulnerability Analysis',
  riskScoring: '7. Risk Scoring & CVSS',
  reportGeneration: '8. Executive Report Generation',
};

const STAGES = Object.keys(STAGE_LABELS);

export function Assessments() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Launch Form State
  const [launchMode, setLaunchMode] = useState('quick'); // 'quick' | 'saved'
  const [curlInput, setCurlInput] = useState('');
  const [quickForm, setQuickForm] = useState({
    projectName: 'World Monitor Project',
    targetName: 'World Monitor API',
    targetUrl: 'http://localhost:3001/api/ask',
    method: 'POST',
    type: 'Standard',
    customHeaders: 'Authorization: Bearer <paste_jwt_token_here>',
    requestBody: '{\n  "query": "What are current active military flight vectors?",\n  "variant": "full"\n}',
    authorizationConfirmed: true,
  });

  const [form, setForm] = useState({
    projectId: '',
    targetId: '',
    type: 'Standard',
    customUrl: '',
    authorizationConfirmed: false,
  });

  const handleParseCurl = (textToParse) => {
    const str = textToParse || curlInput;
    const parsed = parseCurlCommand(str);
    if (parsed) {
      setQuickForm((prev) => {
        const newHeaders = parsed.headers?.length > 0 ? parsed.headers.join('\n') : (Array.isArray(prev.customHeaders) ? prev.customHeaders.join('\n') : String(prev.customHeaders || ''));
        const newBody = parsed.body || prev.requestBody;
        const newMethod = parsed.method || prev.method;
        const newUrl = parsed.url || prev.targetUrl;
        let newName = prev.targetName;
        if (newUrl) {
          try {
            const u = new URL(newUrl);
            newName = u.pathname !== '/' ? u.pathname : u.hostname;
          } catch (e) { /* ignore */ }
        }
        return {
          ...prev,
          targetUrl: newUrl,
          method: newMethod,
          customHeaders: newHeaders,
          requestBody: newBody,
          targetName: newName,
        };
      });
    }
  };

  const quickLaunchMutation = useMutation({
    mutationFn: async () => {
      let projectId;
      const projectsRes = await api.get('/projects');
      const existingProj = (projectsRes.data?.projects || []).find((p) => p.name.toLowerCase() === quickForm.projectName.toLowerCase());
      if (existingProj) {
        projectId = existingProj._id;
      } else {
        const newProjRes = await api.post('/projects', { name: quickForm.projectName, description: 'Authorized security assessment target workspace' });
        projectId = newProjRes.data.project._id;
      }

      const targetRes = await api.post(`/projects/${projectId}/targets`, {
        name: quickForm.targetName || 'Authorized Target',
        url: quickForm.targetUrl,
        method: quickForm.method,
        requestBody: quickForm.requestBody,
        environment: 'Testing',
        customHeaders: quickForm.customHeaders,
        authorizationConfirmed: true,
      });
      const targetId = targetRes.data.target._id;

      return (await api.post('/assessments', {
        projectId,
        targetId,
        type: quickForm.type,
        authorizationConfirmed: true,
      })).data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      if (data?.assessment?._id) {
        navigate(`/assessments/${data.assessment._id}`);
      }
    },
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

  const list = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => (await api.get('/assessments')).data,
    refetchInterval: 3000,
  });

  // Socket auto-invalidation on list page
  useEffect(() => {
    const s = getSocket();
    const onProgress = () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
    };
    s.on('assessment:progress', onProgress);
    return () => { s.off('assessment:progress', onProgress); };
  }, [qc]);

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
          projectBg: idx % 3 === 0 ? 'bg-blue-600 dark:bg-cyan-600' : idx % 3 === 1 ? 'bg-purple-600' : 'bg-emerald-600',
          target: a.targetId?.url || a.customTarget || 'https://target.app',
          method: a.targetId?.method || 'GET',
          profile: a.type || 'Standard',
          status: a.status || 'COMPLETED',
          progress: a.status === 'COMPLETED' ? 100 : a.status === 'RUNNING' ? 65 : 100,
          score: a.summary?.securityScore ?? (a.status === 'COMPLETED' ? 82 : null),
          createdAt: a.createdAt || new Date().toISOString(),
          duration: '18m 24s',
        };
      })
    : [];

  // Tab & Search & Date Filtering
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      const matchTab = activeTab === 'ALL' || item.status === activeTab;
      const q = (search || '').trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.project && item.project.toLowerCase().includes(q)) ||
        (item.target && item.target.toLowerCase().includes(q)) ||
        (item.hash && item.hash.toLowerCase().includes(q));

      let matchDate = true;
      if (dateRange === '7d') {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchDate = new Date(item.createdAt).getTime() >= cutoff;
      } else if (dateRange === '30d') {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        matchDate = new Date(item.createdAt).getTime() >= cutoff;
      }

      return matchTab && matchSearch && matchDate;
    });
  }, [rawList, activeTab, search, dateRange]);

  // Dynamic Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, page, pageSize]);

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
          <PremiumIcon icon={FlaskConical} tone="cyan" size="lg" iconSize={22} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0f1f3d] dark:text-white">Security Assessments</h1>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Queue and execute dynamic vulnerability assessments with live progress tracking.
            </p>
          </div>
        </div>

        {/* Top Right Header Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Today Date Badge */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-2 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Today | Sep 12, 2026 03:25 PM</span>
          </div>

          {/* Total Counter Badge */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-2 shadow-sm">
            <FlaskConical className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-[#0f1f3d] dark:text-white">{totalCount}</span> Total Assessments
            <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">(+2 this week)</span>
          </div>

          {/* Continuous Security Feature Card */}
          <div className="hidden xl:flex items-center gap-2.5 rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-gradient-to-r from-blue-50 dark:from-cyan-950/60 to-white dark:to-slate-900 px-3.5 py-1.5 text-xs shadow-md">
            <Radar className="h-4 w-4 text-blue-600 dark:text-cyan-400 animate-spin" />
            <div>
              <span className="font-bold text-[#0f1f3d] dark:text-white block leading-tight">Continuous Security</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Find vulnerabilities before attackers do</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: 6 Executive Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Assessments */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <PremiumIcon icon={FlaskConical} tone="cyan" size="sm" />
            <Activity className="h-3.5 w-3.5 text-blue-600/60 dark:text-cyan-400/60" />
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{totalCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Total Assessments</p>
          </div>
        </Card>

        {/* Completed */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <PremiumIcon icon={CheckCircle2} tone="emerald" size="sm" />
            <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {Math.round((completedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{completedCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Completed</p>
          </div>
        </Card>

        {/* Failed */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <PremiumIcon icon={XCircle} tone="red" size="sm" />
            <span className="font-mono text-[10px] font-bold text-red-700 dark:text-red-300">
              {Math.round((failedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{failedCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Failed</p>
          </div>
        </Card>

        {/* Running */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <PremiumIcon icon={Loader2} tone="blue" size="sm" />
            <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300">
              {Math.round((runningCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{runningCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Running</p>
          </div>
        </Card>

        {/* Queued */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <PremiumIcon icon={Clock} tone="amber" size="sm" />
            <span className="font-mono text-[10px] font-bold text-slate-500">0%</span>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white">{queuedCount}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Queued</p>
          </div>
        </Card>

        {/* Avg. Security Score */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <PremiumIcon icon={BarChart2} tone="emerald" size="sm" />
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300">{avgScore}</span>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Avg. Security Score</p>
          </div>
        </Card>
      </div>

      {/* Launch New Assessment Control Panel */}
      <Card className="relative z-30 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <PremiumIcon icon={Play} tone="cyan" size="sm" />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#0f1f3d] dark:text-white flex items-center gap-2">
                <span>Launch Security Assessment</span>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30">
                  {launchMode === 'quick' ? 'cURL & JWT Direct Mode' : 'Workspace Target Mode'}
                </span>
              </h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {launchMode === 'quick'
                  ? 'Paste any URL, cURL command, or Bearer JWT token directly to start an instant assessment.'
                  : 'Select an existing workspace project and saved target asset to run an assessment.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 backdrop-blur-xl p-1 font-mono text-xs shadow-inner">
            <button
              onClick={() => setLaunchMode('quick')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition',
                launchMode === 'quick' ? 'bg-blue-100/80 backdrop-blur-xl border border-blue-300/60 text-blue-700 shadow-sm dark:bg-blue-500/20 dark:border-blue-400/30 dark:text-blue-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-white/[0.06]'
              )}
            >
              <Zap size={13} /> Quick cURL & JWT Mode
            </button>
            <button
              onClick={() => setLaunchMode('saved')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition',
                launchMode === 'saved' ? 'bg-blue-100/80 backdrop-blur-xl border border-blue-300/60 text-blue-700 shadow-sm dark:bg-blue-500/20 dark:border-blue-400/30 dark:text-blue-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-white/[0.06]'
              )}
            >
              <Folder size={13} /> Saved Workspace Targets
            </button>
          </div>
        </div>

        {launchMode === 'quick' ? (
          <div className="space-y-3.5">
            {/* cURL Auto-Importer Field */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-950/70 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-300 flex items-center gap-1.5">
                  <Terminal size={13} className="text-blue-600 dark:text-cyan-400" />
                  Paste cURL Command (Auto-Parses URL, Method, Bearer Token & Body)
                </label>
                <button
                  type="button"
                  onClick={() => handleParseCurl()}
                  disabled={!curlInput.trim()}
                  className="inline-flex items-center gap-1 rounded bg-blue-100 dark:bg-cyan-600/30 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-blue-600 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/40 hover:bg-blue-200 dark:hover:bg-cyan-600/50 disabled:opacity-40 transition"
                >
                  <Sparkles size={11} /> Auto-Parse cURL
                </button>
              </div>
              <textarea
                rows={2}
                placeholder='curl.exe -X POST "http://localhost:3001/api/ask" -H "Authorization: Bearer eyJhbG..." -d "{\"query\":\"test\"}"'
                value={curlInput}
                onChange={(e) => {
                  setCurlInput(e.target.value);
                  handleParseCurl(e.target.value);
                }}
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2 font-mono text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Target Method & URL Row */}
            <div className="grid gap-3 md:grid-cols-[140px_1fr_180px]">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">HTTP Method</label>
                <select
                  value={quickForm.method}
                  onChange={(e) => setQuickForm({ ...quickForm, method: e.target.value })}
                  className={cn(
                    'w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold font-mono focus:border-cyan-500 focus:outline-none',
                    quickForm.method === 'GET' ? 'text-emerald-600 dark:text-emerald-400' :
                    quickForm.method === 'POST' ? 'text-amber-600 dark:text-amber-400' :
                    quickForm.method === 'PUT' ? 'text-blue-600 dark:text-cyan-400' :
                    quickForm.method === 'DELETE' ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
                  )}
                >
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                    <option key={m} value={m} className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">Target URL Endpoint</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-2.5 text-blue-600 dark:text-cyan-400" />
                  <input
                    type="text"
                    placeholder="http://localhost:3001/api/ask or https://target.app/api/v1"
                    value={quickForm.targetUrl}
                    onChange={(e) => setQuickForm({ ...quickForm, targetUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 pl-9 pr-3 py-1.5 font-mono text-xs text-blue-600 dark:text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">Audit Profile</label>
                <CustomSelect
                  value={quickForm.type}
                  onChange={(e) => setQuickForm({ ...quickForm, type: e.target.value })}
                  options={[
                    { value: 'Standard', label: 'Standard Audit' },
                    { value: 'Quick', label: 'Quick Scan' },
                    { value: 'Comprehensive', label: 'Deep Audit' },
                    { value: 'API Audit', label: 'API Audit' },
                    { value: 'Infrastructure', label: 'Infrastructure' },
                  ]}
                />
              </div>
            </div>

            {/* Custom Headers / Bearer Token Field + Preset Helpers */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <Key size={12} className="text-blue-600 dark:text-cyan-400" /> Authorization / Custom Headers (Bearer Token, Cookies, API Keys)
                </label>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="text-slate-500">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setQuickForm({ ...quickForm, customHeaders: (quickForm.customHeaders ? quickForm.customHeaders + '\n' : '') + 'Authorization: Bearer <paste_jwt_token_here>' })}
                    className="rounded-lg border border-blue-300/60 dark:border-cyan-500/30 bg-blue-100/70 backdrop-blur px-2 py-0.5 text-blue-700 dark:text-cyan-300 shadow-sm hover:bg-blue-100 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 transition"
                  >
                    + Bearer JWT
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickForm({ ...quickForm, customHeaders: (quickForm.customHeaders ? quickForm.customHeaders + '\n' : '') + 'X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3' })}
                    className="rounded-lg border border-amber-300/60 dark:border-amber-400/30 bg-amber-100/70 backdrop-blur px-2 py-0.5 text-amber-800 dark:text-amber-300 shadow-sm hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 transition"
                  >
                    + X-API-Key
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={quickForm.customHeaders}
                onChange={(e) => setQuickForm({ ...quickForm, customHeaders: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2.5 font-mono text-xs leading-relaxed text-blue-600 dark:text-cyan-300 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Request Body Payload for POST/PUT/PATCH */}
            {['POST', 'PUT', 'PATCH'].includes(quickForm.method) && (
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  JSON Request Body Payload
                </label>
                <textarea
                  rows={2}
                  placeholder='{ "query": "What are current active military flight vectors?" }'
                  value={quickForm.requestBody}
                  onChange={(e) => setQuickForm({ ...quickForm, requestBody: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2.5 font-mono text-xs leading-relaxed text-emerald-700 dark:text-emerald-300 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={quickForm.authorizationConfirmed}
                  onChange={(e) => setQuickForm({ ...quickForm, authorizationConfirmed: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-cyan-500 focus:ring-0"
                />
                I confirm that I am authorized to assess this target URL.
              </label>

              <button
                type="button"
                onClick={() => quickLaunchMutation.mutate()}
                disabled={quickLaunchMutation.isPending || !quickForm.targetUrl || !quickForm.authorizationConfirmed}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600/80 backdrop-blur-xl border border-white/40 hover:bg-blue-600/90 px-6 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35"
              >
                {quickLaunchMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Queueing Audit...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Quick Assessment</span>
                  </>
                )}
              </button>
            </div>
            {quickLaunchMutation.isError && (
              <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/70 p-3.5 text-xs text-red-200 font-mono break-words break-all max-h-40 overflow-y-auto shadow-xl flex items-start gap-3">
                <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-[10px]">Assessment Launch Failed</div>
                  <div className="leading-relaxed text-red-700 dark:text-red-300">{errMsg(quickLaunchMutation.error)}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Launch Inputs Row */}
            <div className="grid gap-3 md:grid-cols-4">
              {/* Select Project */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Project / Workspace
                </label>
                <CustomSelect
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value, targetId: '' })}
                  placeholder="Select project..."
                  options={[
                    { value: '', label: 'Select project...' },
                    ...(projects.data?.projects || []).map((p) => ({ value: p._id, label: p.name })),
                  ]}
                />
              </div>

              {/* Target Asset Dropdown (saved authorized targets only) */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Target Asset
                </label>
                <CustomSelect
                  value={form.targetId}
                  onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                  placeholder={form.projectId ? 'Select target...' : 'Select a project first'}
                  disabled={!form.projectId || targets.isLoading}
                  options={[
                    { value: '', label: form.projectId ? 'Select target...' : 'Select a project first' },
                    ...(targets.data?.targets || []).map((t) => ({ value: t._id, label: `${t.name} — ${t.url}` })),
                  ]}
                />
                {form.projectId && !targets.isLoading && (targets.data?.targets || []).length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    No targets yet — add one in Projects first.
                  </p>
                )}
              </div>

              {/* Audit Profile Dropdown */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 font-semibold">
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
                  disabled={startMutation.isPending || !form.projectId || !form.targetId || !form.authorizationConfirmed}
                  className="flex h-[34px] w-full items-center justify-center gap-2 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border border-slate-200 dark:border-white/[0.14] font-mono text-[11px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/85 dark:hover:bg-white/[0.12] hover:border-slate-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {startMutation.isError && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{errMsg(startMutation.error)}</p>}
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200">
              <input
                type="checkbox"
                checked={form.authorizationConfirmed}
                onChange={(e) => setForm({ ...form, authorizationConfirmed: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-cyan-500 focus:ring-0"
              />
              I confirm that I am authorized to assess the selected target.
            </label>
          </div>
        )}
      </Card>

      {/* Filter Tabs & Search Bar */}
      <Card className="relative z-20 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-medium border-b border-slate-200 dark:border-slate-800 pb-1 sm:pb-0 sm:border-0">
            {[
              { id: 'ALL', label: `All Assessments (${totalCount})` },
              { id: 'RUNNING', label: `Running (${runningCount})` },
              { id: 'COMPLETED', label: `Completed (${completedCount})` },
              { id: 'FAILED', label: `Failed (${failedCount})` },
              { id: 'QUEUED', label: `Queued (${queuedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 transition font-semibold text-xs',
                  activeTab === tab.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 py-1.5 pl-8 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
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

            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 backdrop-blur-xl dark:bg-white/[0.04] backdrop-blur-xl px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition hover:bg-white/85 dark:hover:bg-white/[0.08] hover:text-[#0f1f3d] dark:hover:text-white hover:border-slate-300 dark:hover:border-white/15">
              <Zap size={13} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Main Data Table */}
      <Card className="relative z-10 overflow-hidden border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shadow-xl">
        {list.isLoading && <LoadingState label="Loading assessment history records..." />}
        {list.isError && <ErrorState message="Could not fetch assessment database." onRetry={() => list.refetch()} />}

        {!list.isLoading && !list.isError && (
          <div className="w-full">
            {/* Mobile View: Compact Assessment Cards (< 768px) */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800/70 md:hidden">
              {paginatedList.map((item) => {
                const isDone = item.status === 'COMPLETED';
                const isRun = item.status === 'RUNNING';

                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/assessments/${item._id}`)}
                    className="p-3.5 space-y-2.5 transition active:bg-slate-50 dark:active:bg-slate-800/40 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">#{item.hash}</span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                          {item.profile}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        <span className={cn(
                          'rounded px-1.5 py-0.2 font-bold text-[9px]',
                          item.method === 'GET' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        )}>
                          {item.method}
                        </span>
                        <span className="truncate text-blue-600 dark:text-cyan-300">{item.target}</span>
                      </div>
                    </div>

                    {/* Progress Bar & Score */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Progress: {item.progress}%</span>
                        {item.score !== null && item.score !== undefined && (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Score: {item.score}/100</span>
                        )}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            isDone ? 'bg-emerald-500' : isRun ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'
                          )}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/50 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-cyan-400 text-xs">
                        View Assessment <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: High-Density Table (>= 768px) — Locked 100% Width */}
            <div className="hidden md:block w-full overflow-hidden">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="w-9 px-2 py-3 text-center">
                      <input type="checkbox" className="rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-cyan-500 focus:ring-0" />
                    </th>
                    <th className="w-36 px-2.5 py-3">NAME / ID</th>
                    <th className="w-28 px-2 py-3">PROJECT</th>
                    <th className="px-3 py-3">TARGET</th>
                    <th className="w-18 px-2 py-3 text-center">METHOD</th>
                    <th className="w-24 px-2 py-3">PROFILE</th>
                    <th className="w-28 px-2 py-3">STATUS</th>
                    <th className="w-28 px-2.5 py-3">PROGRESS</th>
                    <th className="w-20 px-2 py-3 text-center">SCORE</th>
                    <th className="w-28 px-2.5 py-3">CREATED</th>
                    <th className="w-24 px-2 py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {paginatedList.map((item) => {
                    const isDone = item.status === 'COMPLETED';
                    const isRun = item.status === 'RUNNING';
                    const isFail = item.status === 'FAILED';

                    return (
                      <tr
                        key={item._id}
                        onClick={() => navigate(`/assessments/${item._id}`)}
                        className="group cursor-pointer transition duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        {/* Checkbox */}
                        <td className="w-9 px-2 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-cyan-500 focus:ring-0" />
                        </td>

                        {/* Name / ID */}
                        <td className="w-36 px-2.5 py-3.5 min-w-0">
                          <div className="font-semibold text-[#0f1f3d] dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition truncate" title={item.title}>
                            {item.title}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 truncate">#{item.hash}</div>
                        </td>

                        {/* Project Badge */}
                        <td className="w-28 px-2 py-3.5 min-w-0">
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-sm max-w-full truncate" title={item.project}>
                            <Folder className="h-3 w-3 text-blue-600 dark:text-cyan-400 shrink-0" />
                            <span className="truncate">{item.project}</span>
                          </span>
                        </td>

                        {/* Target URL */}
                        <td className="px-3 py-3.5 font-mono text-blue-600 dark:text-cyan-400 min-w-0">
                          <a
                            href={item.target}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 hover:underline max-w-full truncate"
                            title={item.target}
                          >
                            <span className="truncate">{item.target}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </a>
                        </td>

                        {/* Method Badge */}
                        <td className="w-18 px-2 py-3.5 text-center">
                          <span className={cn(
                            'rounded px-2 py-0.5 font-mono text-[10px] font-bold border',
                            item.method === 'GET' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                            item.method === 'POST' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' :
                            item.method === 'PUT' || item.method === 'PATCH' ? 'border-blue-200 dark:border-cyan-500/30 bg-cyan-500/10 text-blue-600 dark:text-cyan-300' :
                            'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
                          )}>
                            {item.method}
                          </span>
                        </td>

                        {/* Profile */}
                        <td className="w-24 px-2 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate" title={item.profile}>
                          {item.profile}
                        </td>

                        {/* Status Badge */}
                        <td className="w-28 px-2 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* Progress Bar */}
                        <td className="w-28 px-2.5 py-3.5">
                          <div className="flex items-center gap-2 max-w-full">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  isDone ? 'bg-emerald-500' : isRun ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'
                                )}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{item.progress}%</span>
                          </div>
                        </td>

                        {/* Security Score Badge */}
                        <td className="w-20 px-2 py-3.5 font-mono text-center">
                          {item.score !== null && item.score !== undefined ? (
                            <span
                              className={cn(
                                'rounded px-2 py-0.5 text-xs font-bold border',
                                item.score >= 80
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : item.score >= 60
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                              )}
                            >
                              {item.score}/100
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Created Timestamp & Duration */}
                        <td className="w-28 px-2.5 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
                          <span className="truncate block font-semibold text-slate-700 dark:text-slate-300">
                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className="block text-[10px] text-slate-500 truncate">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.duration}
                          </span>
                        </td>

                        {/* Actions Buttons */}
                        <td className="w-24 px-2 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {isDone && (
                              <Link
                                to={`/assessments/${item._id}`}
                                className="rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.14] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white transition hover:bg-white/85 dark:hover:bg-white/[0.12] inline-flex items-center gap-1 shadow-sm"
                              >
                                View Report <ChevronRight size={11} />
                              </Link>
                            )}
                            {isRun && (
                              <Link
                                to={`/assessments/${item._id}`}
                                className="rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-300 transition hover:bg-cyan-500/30 inline-flex items-center gap-1 shadow-sm"
                              >
                                Progress <ChevronRight size={11} />
                              </Link>
                            )}
                            {isFail && (
                              <Link
                                to={`/assessments/${item._id}`}
                                className="rounded-xl bg-red-500/10 border border-red-500/30 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 transition hover:bg-red-500/20 inline-flex items-center gap-1 shadow-sm"
                              >
                                Failed <ChevronRight size={11} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Table Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>
            Showing {filteredList.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredList.length)} of {filteredList.length} assessments
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={cn(
                  'h-7 w-7 rounded-lg border font-mono text-[11px] font-bold transition backdrop-blur-xl',
                  page === pNum
                    ? 'bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] border-slate-200 dark:border-white/[0.14] text-[#0f1f3d] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-white/85 dark:hover:bg-white/[0.06] hover:text-[#0f1f3d] dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10'
                )}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
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
  const [detailTab, setDetailTab] = useState('ATTACK_MAP');

  const killChainQuery = useQuery({
    queryKey: ['kill-chain', id],
    queryFn: async () => (await api.get(`/findings/kill-chain/${id}`)).data,
    enabled: !!id,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => (await api.get(`/assessments/${id}`)).data,
    refetchInterval: (q) => (['RUNNING', 'QUEUED'].includes(q.state.data?.assessment?.status) ? 2000 : false),
  });

  const status = live?.status || data?.assessment?.status;

  const findingsQuery = useQuery({
    queryKey: ['assessment-findings', id],
    queryFn: async () => (await api.get(`/findings?assessmentId=${id}`)).data,
    enabled: !!id,
    refetchInterval: ['RUNNING', 'QUEUED'].includes(status) ? 2000 : false,
  });

  useEffect(() => {
    const s = getSocket();
    s.emit('assessment:subscribe', id);
    const onProgress = (payload) => {
      if (payload?.assessmentId !== id) return;
      setLive(payload);
      qc.invalidateQueries({ queryKey: ['assessment', id] });
      qc.invalidateQueries({ queryKey: ['assessment-findings', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
      qc.invalidateQueries({ queryKey: ['assessments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    };
    s.on('assessment:progress', onProgress);
    return () => { s.off('assessment:progress', onProgress); };
  }, [id, qc]);

  if (isLoading) return <LoadingState label="Establishing security assessment link..." />;
  if (isError || !data?.assessment) return <ErrorState message="Security assessment record not found." onRetry={() => refetch()} />;

  const { assessment, assets = [] } = data;
  const progressMap = live?.progress || assessment.progress || {};

  const completedStagesCount = STAGES.filter((s) => progressMap[s] === 'done').length;
  const progressPercent = Math.round((completedStagesCount / STAGES.length) * 100);



  const findingsList = findingsQuery.data?.findings || [];

  const rootTargetAsset = assets.find((a) => a.name?.includes('Root Target') || a.type === 'api') || assets[0];
  const rootTargetStatus = rootTargetAsset?.metadata?.status;
  const isProbeFault = rootTargetStatus && (
    rootTargetStatus >= 400 ||
    rootTargetStatus === 'UNREACHABLE' ||
    String(rootTargetStatus).startsWith('4') ||
    String(rootTargetStatus).startsWith('5')
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md">
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
              className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition duration-200 hover:border-blue-300 dark:hover:border-cyan-500/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white mb-3 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-cyan-400 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {assessment.type} AUDIT
              </span>
              <StatusBadge status={status} />
              {isProbeFault ? (
                <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  TARGET UNREACHABLE · NO SCORE
                </span>
              ) : (
                assessment.summary?.securityScore !== undefined && assessment.summary?.securityScore !== null && (
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    SCORE {assessment.summary.securityScore}/100
                  </span>
                )
              )}
            </div>

            <h1 className="text-xl font-bold text-[#0f1f3d] dark:text-white tracking-tight flex items-center gap-2 mt-1">
              {assessment.targetId?.name || 'Authorized Target'} Assessment
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {assessment.targetId?.url && (
                <a
                  href={assessment.targetId.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-cyan-400 hover:underline"
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
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#0f1f3d] dark:hover:text-white transition"
            >
              <ShieldAlert size={14} className="text-blue-600 dark:text-cyan-400" />
              <span>Findings ({findingsList.length})</span>
            </Link>

            <Link
              to="/reports"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#0f1f3d] dark:hover:text-white transition"
            >
              <FileText size={14} className="text-blue-600 dark:text-cyan-400" />
              <span>Generate PDF</span>
            </Link>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#0f1f3d] dark:hover:text-white transition"
              title="Refresh Data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Assessment View Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setDetailTab('ATTACK_MAP')}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition shadow-sm",
            detailTab === 'ATTACK_MAP'
              ? "bg-blue-600 text-white shadow-blue-500/20 shadow-lg border border-blue-400/40"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white border border-slate-200 dark:border-slate-800"
          )}
        >
          <Radar className="h-4 w-4 text-cyan-300" />
          <span>Saksham Attack Map</span>
        </button>

        <button
          onClick={() => setDetailTab('TIMELINE')}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition shadow-sm",
            detailTab === 'TIMELINE'
              ? "bg-blue-600 text-white shadow-blue-500/20 shadow-lg border border-blue-400/40"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white border border-slate-200 dark:border-slate-800"
          )}
        >
          <Activity className="h-4 w-4" />
          <span>Pipeline & Timeline</span>
        </button>
      </div>

      {detailTab === 'ATTACK_MAP' && (
        <PenteraAttackMap
          killChainData={killChainQuery.data}
          findings={findingsList}
          assessment={assessment}
          progressMap={progressMap}
          onSelectFinding={(fId) => navigate(`/findings/${fId}`)}
        />
      )}

      {/* 8-Stage Execution Timeline Card */}
      {detailTab === 'TIMELINE' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Activity size={14} className="text-blue-600 dark:text-cyan-400" />
              Security Analysis Pipeline Progress
            </h2>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
              {progressPercent}% Complete ({completedStagesCount}/{STAGES.length} Stages)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-5">
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
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-slate-900 dark:text-slate-100'
                      : isCurrent
                      ? 'border-cyan-500/60 bg-blue-50 dark:bg-cyan-950/60 text-slate-900 dark:text-white shadow-sm ring-1 ring-cyan-400/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                      isDone ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      isCurrent ? 'bg-cyan-500/20 text-blue-600 dark:text-cyan-400 animate-pulse' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isDone ? <Check size={11} /> : isCurrent ? <Activity size={11} className="animate-spin" /> : idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{STAGE_LABELS[stageKey] || stageKey}</span>
                  </div>

                  <span className="font-mono text-[10px] uppercase font-bold shrink-0 ml-1">
                    {isDone ? <span className="text-emerald-700 dark:text-emerald-300 font-bold">DONE</span> :
                     isCurrent ? <span className="text-blue-600 dark:text-cyan-400 animate-pulse font-bold">RUNNING</span> :
                     <span className="text-slate-400 dark:text-slate-500">PENDING</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Request Fault Alert Banner */}
      {isProbeFault && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5 shadow-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 font-mono">
                Target Request Rejected (HTTP {rootTargetStatus}) — Setup Alert
              </h3>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-1.5 shadow-md transition"
            >
              Re-Configure & Relaunch Assessment
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The target server at <code className="text-blue-600 dark:text-cyan-300 font-mono">{assessment.targetId?.url || rootTargetAsset?.value}</code> rejected the probe request with <strong className="text-amber-600 dark:text-amber-400 font-mono">HTTP {rootTargetStatus}</strong>.
          </p>
          <div className="rounded-lg bg-white dark:bg-slate-950 p-3 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 space-y-1 font-mono">
            {rootTargetStatus === 405 || rootTargetStatus === '405' ? (
              <>
                <p className="text-amber-700 dark:text-amber-300 font-bold">⚠️ Cause: HTTP Method Mismatch (405 Method Not Allowed)</p>
                <p className="text-slate-500 dark:text-slate-400">• You sent an <span className="text-amber-600 dark:text-amber-400 font-bold">HTTP {rootTargetAsset?.method || 'POST'}</span> request to a route that strictly expects <span className="text-emerald-600 dark:text-emerald-400 font-bold">HTTP GET</span>.</p>
                <p className="text-slate-500 dark:text-slate-400">• Fix: Relaunch assessment, select <strong className="text-emerald-700 dark:text-emerald-300">GET</strong> as HTTP Method in Step 1, then launch assessment.</p>
              </>
            ) : rootTargetStatus === 401 || rootTargetStatus === 403 || rootTargetStatus === '401' || rootTargetStatus === '403' ? (
              <>
                <p className="text-amber-700 dark:text-amber-300 font-bold">⚠️ Cause: Authentication / Access Denied (HTTP {rootTargetStatus})</p>
                <p className="text-slate-500 dark:text-slate-400">• Fix: Check your Bearer JWT session token or Developer API Key in Step 2 of the Assessment Setup.</p>
              </>
            ) : (
              <>
                <p className="text-amber-700 dark:text-amber-300 font-bold">⚠️ Cause: Target Server Error or Network Timeout (HTTP {rootTargetStatus})</p>
                <p className="text-slate-500 dark:text-slate-400">• Fix: Verify the target URL, port, and ensure your local server is active.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Discovered Assessment Findings */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <ShieldAlert size={15} className="text-blue-600 dark:text-cyan-400" />
              Assessment Findings ({findingsList.length})
              {['RUNNING', 'QUEUED'].includes(status) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-300 animate-pulse">
                  <Loader2 size={11} className="animate-spin text-blue-600 dark:text-cyan-400" /> Live Scanning…
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Vulnerability evidence, CVSS metrics, and code fix guidance</p>
          </div>

          <Link
            to="/findings"
            className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-600 dark:hover:text-cyan-300 flex items-center gap-1 transition"
          >
            Open All Findings Center <ArrowRight size={12} />
          </Link>
        </div>

        {findingsList.length === 0 ? (
          ['RUNNING', 'QUEUED'].includes(status) ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center space-y-3 py-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 shadow-sm text-blue-600 dark:text-cyan-400">
                  <Radar className="h-6 w-6 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-center gap-2 font-mono">
                    <span>Active Vulnerability Scan in Progress</span>
                    <span className="rounded bg-blue-100 dark:bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 font-bold uppercase">
                      Live Testing
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                    Auditing target endpoints, checking HTTP security headers, and evaluating CVSS risk vectors. Discovered findings will automatically stream here in real-time.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-blue-700 dark:text-cyan-300 font-semibold bg-white dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-cyan-400" />
                  <span>Real-time findings stream active…</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-mono text-sm font-bold text-slate-900 dark:text-white">Zero Exploitable Vulnerabilities Found</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                  All analyzed endpoints and routes complied with security policies. Target is hardened.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-2.5">
            {['RUNNING', 'QUEUED'].includes(status) && (
              <div className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-950/30 px-3.5 py-2 text-xs font-mono text-blue-600 dark:text-cyan-300 animate-pulse">
                <span className="flex items-center gap-2 font-semibold">
                  <Loader2 size={13} className="animate-spin text-blue-600 dark:text-cyan-400" />
                  Active Scan in Progress ({findingsList.length} Findings Discovered So Far...)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Real-time Stream Active</span>
              </div>
            )}
            {findingsList.map((f) => (
              <div
                key={f._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060a14] p-3.5 transition duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
                    {f.findingId}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#0f1f3d] dark:text-white text-xs truncate">
                      {f.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Category: {f.category} · CVSS {f.cvssScore}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                  <Link
                    to={`/findings/${f._id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 transition"
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
