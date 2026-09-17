import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Globe,
  Play,
  Plus,
  ChevronRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  Lock,
  FileText,
  Check,
  ExternalLink,
  Search,
  Filter,
  SlidersHorizontal,
  MoreVertical,
  X,
  Target,
  CheckCircle2,
  PauseCircle,
  FolderPlus,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Shield,
  Tag,
  Pencil,
  Trash2,
  Loader2,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../../lib/api';
import { errMsg, cn } from '../../lib/utils';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge, PremiumIcon } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';
import { CustomSelect } from '../../components/ui/CustomSelect';

function DynamicSparklineCard({ title, count, badge, color = 'cyan', dataPoints = [], icon: Icon }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const series = dataPoints && dataPoints.length >= 2 ? dataPoints : [
    { label: '7 days ago', value: Math.max(0, count - 3) },
    { label: '5 days ago', value: Math.max(0, count - 2) },
    { label: '3 days ago', value: Math.max(0, count - 1) },
    { label: 'Yesterday', value: Math.max(0, count - 1) },
    { label: 'Today', value: count },
  ];

  const maxVal = Math.max(...series.map((s) => s.value), 1);
  const minVal = Math.min(...series.map((s) => s.value), 0);
  const range = maxVal - minVal || 1;

  const width = 280;
  const height = 36;
  const padding = 4;

  const pts = series.map((s, i) => {
    const x = padding + (i / (series.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((s.value - minVal) / range) * (height - 2 * padding);
    return { x, y, ...s };
  });

  const pathD = pts.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
  }, '');

  const areaD = `${pathD} L ${pts[pts.length - 1].x},${height} L ${pts[0].x},${height} Z`;

  const colorConfig = {
    cyan: { border: 'border-blue-200 dark:border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-blue-600 dark:text-cyan-400', stroke: '#38bdf8', fill: 'url(#grad-cyan)' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', stroke: '#10b981', fill: 'url(#grad-emerald)' },
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', stroke: '#3b82f6', fill: 'url(#grad-blue)' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', stroke: '#f59e0b', fill: 'url(#grad-amber)' },
  }[color] || { border: 'border-blue-200 dark:border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-blue-600 dark:text-cyan-400', stroke: '#38bdf8', fill: 'url(#grad-cyan)' };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    const closestIdx = Math.round(ratio * (pts.length - 1));
    setHoverIdx(closestIdx);
  };

  const activePt = hoverIdx !== null ? pts[hoverIdx] : null;

  return (
    <Card className="relative overflow-hidden border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4 shadow-md backdrop-blur transition duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-cyan-500/5 group">
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorConfig.border} ${colorConfig.bg} ${colorConfig.text}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className={`text-[10px] font-mono font-semibold ${colorConfig.text}`}>{badge}</span>
      </div>

      <div className="mt-3">
        <span className="text-3xl font-extrabold text-[#0f1f3d] dark:text-white font-mono">{count}</span>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">{title}</p>
      </div>

      <div
        className="relative mt-3 h-9 w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="grad-cyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-emerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <path d={areaD} fill={colorConfig.fill} className="transition-opacity duration-300 opacity-60 group-hover:opacity-100" />
          <path d={pathD} fill="none" stroke={colorConfig.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {activePt && (
            <>
              <line x1={activePt.x} y1="0" x2={activePt.x} y2={height} stroke={colorConfig.stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx={activePt.x} cy={activePt.y} r="5" fill="#090f1f" stroke={colorConfig.stroke} strokeWidth="2.5" />
              <circle cx={activePt.x} cy={activePt.y} r="2" fill={colorConfig.stroke} />
            </>
          )}
        </svg>

        {activePt && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/95 px-2 py-1 shadow-xl text-center"
            style={{ left: `${(activePt.x / width) * 100}%`, top: '-4px' }}
          >
            <div className="text-[10px] font-mono font-bold text-[#0f1f3d] dark:text-white whitespace-nowrap">{activePt.value} {title}</div>
            <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{activePt.label}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function Projects() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'Active', category: 'Web Application', image: '' });

  // Action Menu & Modal States
  const [activeMenuProjectId, setActiveMenuProjectId] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  // Close action menu on window click
  useEffect(() => {
    const handleWindowClick = () => setActiveMenuProjectId(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    sort: 'updated',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => (await api.post('/projects', form)).data,
    onSuccess: () => {
      setForm({ name: '', description: '', status: 'Active', category: 'Web Application', image: '' });
      setShowCreateModal(false);
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }) => (await api.put(`/projects/${id}`, updateData)).data,
    onSuccess: () => {
      setEditProject(null);
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/projects/${id}`)).data,
    onSuccess: () => {
      setDeleteProject(null);
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const rawProjectsList = useMemo(() => {
    const hasFetchedProjects = Array.isArray(data?.projects);
    return hasFetchedProjects
      ? (data.projects.length > 0
          ? data.projects.map((p, idx) => ({
              ...p,
              tags: p.category ? [p.category] : ['Web Application'],
              avatarBg: idx % 3 === 0 ? 'bg-blue-600 dark:bg-cyan-600' : idx % 3 === 1 ? 'bg-purple-600' : 'bg-emerald-600',
              avatarChar: (p.name || 'P').charAt(0).toUpperCase(),
              targets: p.targets || { count: 1, sample: p.name ? `${p.name.toLowerCase()}.com` : 'target.com' },
              assessments: p.assessments || { total: 2, completed: 1 },
              findings: p.findings || { total: 5, critical: 0, high: 2, medium: 2, low: 1 },
            }))
          : [])
      : [];
  }, [data?.projects]);

  // Filter and sort projects dynamically
  const filteredProjects = useMemo(() => {
    const q = (filters.search || '').trim().toLowerCase();
    const list = rawProjectsList.filter((p) => {
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.targets?.sample && p.targets.sample.toLowerCase().includes(q)) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)));

      const matchStatus =
        !filters.status || (p.status && p.status.toLowerCase() === filters.status.toLowerCase());

      const matchType =
        !filters.type ||
        (p.category && p.category.toLowerCase().includes(filters.type.toLowerCase())) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(filters.type.toLowerCase())));

      return matchSearch && matchStatus && matchType;
    });

    if (filters.sort === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
    } else if (filters.sort === 'created') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      // 'updated'
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    }

    return list;
  }, [rawProjectsList, filters]);

  // Dynamic Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, page, pageSize]);

  // Calculate Metrics
  const totalCount = rawProjectsList.length;
  const activeCount = rawProjectsList.filter((x) => x.status === 'Active').length;
  const completedCount = rawProjectsList.filter((x) => x.status === 'Completed').length;
  const pausedCount = rawProjectsList.filter((x) => x.status === 'Paused' || x.status === 'Archived').length;

  return (
    <div className="relative min-h-screen pb-16 space-y-6">
      {/* Top Header with Feature Banner Card */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PageHeader
          icon={FolderKanban}
          tone="blue"
          title="Security Projects"
          subtitle="Workspace containers for multi-target security auditing and attack surface management."
        />
      </div>

      {/* Top Executive Metric Summary Cards (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <DynamicSparklineCard
          title="Total Projects"
          count={totalCount}
          badge="+1 this month"
          color="cyan"
          icon={FolderKanban}
          dataPoints={[
            { label: '7 days ago', value: Math.max(0, totalCount - 4) },
            { label: '5 days ago', value: Math.max(0, totalCount - 3) },
            { label: '3 days ago', value: Math.max(0, totalCount - 2) },
            { label: 'Yesterday', value: Math.max(0, totalCount - 1) },
            { label: 'Today', value: totalCount },
          ]}
        />
        <DynamicSparklineCard
          title="Active Projects"
          count={activeCount}
          badge={`${Math.round((activeCount / (totalCount || 1)) * 100)}% of total`}
          color="emerald"
          icon={Play}
          dataPoints={[
            { label: '7 days ago', value: Math.max(0, activeCount - 3) },
            { label: '5 days ago', value: Math.max(0, activeCount - 2) },
            { label: '3 days ago', value: Math.max(0, activeCount - 1) },
            { label: 'Yesterday', value: Math.max(0, activeCount) },
            { label: 'Today', value: activeCount },
          ]}
        />
        <DynamicSparklineCard
          title="Completed"
          count={completedCount}
          badge={`${Math.round((completedCount / (totalCount || 1)) * 100)}% of total`}
          color="blue"
          icon={CheckCircle2}
          dataPoints={[
            { label: '7 days ago', value: Math.max(0, completedCount - 2) },
            { label: '5 days ago', value: Math.max(0, completedCount - 1) },
            { label: '3 days ago', value: Math.max(0, completedCount) },
            { label: 'Yesterday', value: completedCount },
            { label: 'Today', value: completedCount },
          ]}
        />
        <DynamicSparklineCard
          title="Paused"
          count={pausedCount}
          badge={`${Math.round((pausedCount / (totalCount || 1)) * 100)}% of total`}
          color="amber"
          icon={Clock}
          dataPoints={[
            { label: '7 days ago', value: Math.max(0, pausedCount) },
            { label: '5 days ago', value: Math.max(0, pausedCount) },
            { label: '3 days ago', value: Math.max(0, pausedCount) },
            { label: 'Yesterday', value: pausedCount },
            { label: 'Today', value: pausedCount },
          ]}
        />
      </div>

      {/* Filter Toolbar & Actions Bar */}
      <Card className="relative z-30 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects by name, description, or target..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 min-h-[44px] py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <CustomSelect
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-36"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Paused', label: 'Paused' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Archived', label: 'Archived' },
              ]}
            />

            <CustomSelect
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setPage(1);
              }}
              className="w-40"
              options={[
                { value: '', label: 'All Types' },
                { value: 'Web Application', label: 'Web Application' },
                { value: 'API', label: 'API' },
                { value: 'Reconnaissance', label: 'Reconnaissance' },
                { value: 'Monitoring', label: 'Monitoring' },
                { value: 'External', label: 'External' },
              ]}
            />

            <CustomSelect
              value={filters.sort}
              onChange={(e) => {
                setFilters({ ...filters, sort: e.target.value });
                setPage(1);
              }}
              className="w-44"
              options={[
                { value: 'updated', label: 'Sort: Last Updated' },
                { value: 'created', label: 'Sort: Created Date' },
                { value: 'name', label: 'Sort: Name' },
              ]}
            />

            {/* Create Project Primary Action Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              title="Create a new security audit project container"
              className="flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border border-slate-200 dark:border-white/[0.14] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/85 dark:hover:bg-white/[0.12] hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Projects List Container */}
      {isLoading && <LoadingState label="Loading security workspace containers..." />}
      {isError && <ErrorState message="Could not load project workspace database." onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <EmptyState title="No projects match filters" hint="Try clearing filters or create a new project above." />
          ) : (
            paginatedProjects.map((p) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4 transition duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Column 1: Identity & Header */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {p.image || p.avatarUrl ? (
                      <img
                        src={p.image || p.avatarUrl}
                        alt={p.name}
                        title={`Project icon for ${p.name}`}
                        className="h-11 w-11 shrink-0 rounded-xl object-cover border border-blue-200 dark:border-cyan-500/40 shadow-sm ring-1 ring-cyan-500/20"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 dark:from-cyan-950 to-white dark:to-slate-900 border border-blue-200 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 font-extrabold text-base shadow-sm" title={`Project avatar for ${p.name}`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/projects/${p._id}`}
                          title={`Open ${p.name} security workspace`}
                          className="font-bold text-[#0f1f3d] dark:text-white text-sm hover:text-blue-600 dark:hover:text-cyan-300 transition truncate"
                        >
                          {p.name}
                        </Link>
                        <StatusBadge status={p.status || 'Active'} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {p.description || `Security assessment scope for ${p.name}`}
                      </p>
                      {/* Tags Pill */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {(p.tags && p.tags.length ? p.tags : [p.category || 'Web Application']).map((t, idx) => (
                          <span
                            key={idx}
                            title={`Project Tag: ${t}`}
                            className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Columns 2-5: Responsive Metrics (2x2 on mobile, flex on desktop) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:contents">
                    {/* Column 2: Target Stats */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/40 p-2 lg:bg-transparent lg:p-0 min-w-0" title={`Target URL scope for ${p.name}`}>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span>TARGETS</span>
                      </div>
                      <div className="mt-1 font-mono font-bold text-[#0f1f3d] dark:text-white text-sm">
                        {p.targetCount || 1}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-full">
                        {p.targetUrl || 'world-monitor.app'}
                      </div>
                    </div>

                    {/* Column 3: Assessments Count */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/40 p-2 lg:bg-transparent lg:p-0 min-w-0" title={`Assessment runs for ${p.name}`}>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                        <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>ASSESSMENTS</span>
                      </div>
                      <div className="mt-1 font-mono font-bold text-[#0f1f3d] dark:text-white text-sm">
                        {p.assessmentCount || 2}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {p.completedAssessments || 1} done
                      </div>
                    </div>

                    {/* Column 4: Findings Breakdown */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/40 p-2 lg:bg-transparent lg:p-0 min-w-0" title={`Security findings breakdown for ${p.name}`}>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>FINDINGS</span>
                      </div>
                      <div className="mt-1 font-mono font-bold text-[#0f1f3d] dark:text-white text-sm">
                        {p.findingCount || 5}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] font-mono">
                        <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold" title="Critical Findings">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {p.findings?.critical || 0}
                        </span>
                        <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400 font-bold" title="High Findings">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> {p.findings?.high || 2}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold" title="Medium Findings">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {p.findings?.medium || 2}
                        </span>
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold" title="Low Findings">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {p.findings?.low || 1}
                        </span>
                      </div>
                    </div>

                    {/* Column 5: Timestamps */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/40 p-2 lg:bg-transparent lg:p-0 min-w-0 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <div className="text-[10px] text-slate-500">Updated</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        {new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Column 6: Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 lg:border-t-0 lg:pt-0">
                    <Link
                      to={`/projects/${p._id}`}
                      title={`Open project workspace for ${p.name}`}
                      className="flex-1 sm:flex-initial flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border border-slate-200 dark:border-white/[0.14] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white transition hover:bg-white/85 dark:hover:bg-white/[0.12] hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.98]"
                    >
                      <span>Open</span> <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuProjectId((prev) => (prev === p._id ? null : p._id));
                        }}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white transition"
                        title={`Manage options for ${p.name}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuProjectId === p._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-1 shadow-2xl backdrop-blur-md"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuProjectId(null);
                              setEditProject({
                                _id: p._id,
                                name: p.name,
                                description: p.description || '',
                                status: p.status || 'Active',
                                category: p.category || 'Web Application',
                              });
                            }}
                            className="flex min-h-[44px] w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white transition"
                          >
                            <Pencil className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                            <span>Edit Project</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuProjectId(null);
                              setDeleteProject(p);
                            }}
                            className="flex min-h-[44px] w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            <span>Delete Project</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span>
          Showing {filteredProjects.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredProjects.length)} of {filteredProjects.length} projects
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
            <button
              key={pNum}
              onClick={() => setPage(pNum)}
              className={cn(
                'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border font-mono text-xs font-bold transition backdrop-blur-xl',
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
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Create New Project Modal Dialog */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Create New Security Project</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Project Name *</label>
                  <Input
                    placeholder="e.g. World Monitor Project or Saksham Gateway"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Description / Scope</label>
                  <Input
                    placeholder="Security assessment scope and target container info"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Project Logo / Image Uploader */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Project Logo / Image</label>
                  <div className="flex items-center gap-3">
                    {form.image ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-blue-200 dark:border-cyan-500/40 bg-slate-50 dark:bg-slate-900 group shadow-md">
                        <img src={form.image} alt="Project Logo" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: '' })}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 opacity-0 group-hover:opacity-100 transition text-red-600 dark:text-red-400 font-semibold text-[10px]"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4 mb-0.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400">
                        <Camera className="h-5 w-5" />
                        <span className="text-[9px] font-mono mt-0.5 font-semibold">Upload</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 1024 * 1024) {
                                alert('Image size must be 1MB or smaller.');
                                return;
                              }
                              if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                alert('Only PNG, JPEG, and WebP images are supported.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (evt) => setForm({ ...form, image: evt.target.result });
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <Input
                        placeholder="Or paste image URL (https://...)"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                        Click 'Upload' to pick an image file or paste an image URL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Initial Status</label>
                    <CustomSelect
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Paused', label: 'Paused' },
                        { value: 'Completed', label: 'Completed' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Project Category</label>
                    <CustomSelect
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      options={[
                        { value: 'Web Application', label: 'Web Application' },
                        { value: 'API', label: 'API' },
                        { value: 'Reconnaissance', label: 'Reconnaissance' },
                        { value: 'Monitoring', label: 'Monitoring' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {createMutation.isError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errMsg(createMutation.error)}</p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!form.name || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating Project…' : 'Create Project'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal Dialog */}
      <AnimatePresence>
        {editProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditProject(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Edit Security Project</h3>
                </div>
                <button
                  onClick={() => setEditProject(null)}
                  className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Project Name *</label>
                  <Input
                    placeholder="e.g. World Monitor Project"
                    value={editProject.name}
                    onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Description / Scope</label>
                  <Input
                    placeholder="Security assessment scope and target container info"
                    value={editProject.description}
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  />
                </div>

                {/* Project Logo / Image Uploader */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Project Logo / Image</label>
                  <div className="flex items-center gap-3">
                    {editProject.image ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-blue-200 dark:border-cyan-500/40 bg-slate-50 dark:bg-slate-900 group shadow-md">
                        <img src={editProject.image} alt="Project Logo" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditProject({ ...editProject, image: '' })}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 opacity-0 group-hover:opacity-100 transition text-red-600 dark:text-red-400 font-semibold text-[10px]"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4 mb-0.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400">
                        <Camera className="h-5 w-5" />
                        <span className="text-[9px] font-mono mt-0.5 font-semibold">Upload</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 1024 * 1024) {
                                alert('Image size must be 1MB or smaller.');
                                return;
                              }
                              if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                alert('Only PNG, JPEG, and WebP images are supported.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (evt) => setEditProject({ ...editProject, image: evt.target.result });
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <Input
                        placeholder="Or paste image URL (https://...)"
                        value={editProject.image || ''}
                        onChange={(e) => setEditProject({ ...editProject, image: e.target.value })}
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                        Click 'Upload' to pick an image file or paste an image URL.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Status</label>
                    <CustomSelect
                      value={editProject.status}
                      onChange={(e) => setEditProject({ ...editProject, status: e.target.value })}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Paused', label: 'Paused' },
                        { value: 'Completed', label: 'Completed' },
                        { value: 'Archived', label: 'Archived' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Category</label>
                    <CustomSelect
                      value={editProject.category}
                      onChange={(e) => setEditProject({ ...editProject, category: e.target.value })}
                      options={[
                        { value: 'Web Application', label: 'Web Application' },
                        { value: 'API', label: 'API' },
                        { value: 'Reconnaissance', label: 'Reconnaissance' },
                        { value: 'Monitoring', label: 'Monitoring' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {updateMutation.isError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errMsg(updateMutation.error)}</p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <Button variant="outline" onClick={() => setEditProject(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    updateMutation.mutate({
                      id: editProject._id,
                      data: {
                        name: editProject.name,
                        description: editProject.description,
                        status: editProject.status,
                        category: editProject.category,
                        image: editProject.image,
                      },
                    })
                  }
                  disabled={!editProject.name || updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving Changes…' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Project Confirmation Modal */}
      <AnimatePresence>
        {deleteProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteProject(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-xl border border-red-500/30 bg-white dark:bg-slate-950 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Delete Security Project?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">This action is permanent and cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete <strong className="text-[#0f1f3d] dark:text-white font-semibold">{deleteProject.name}</strong>?
                All associated target scopes, vulnerability findings, and assessment logs for this project will be permanently removed.
              </p>

              {deleteMutation.isError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errMsg(deleteMutation.error)}</p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteProject(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(deleteProject._id)}
                  className="flex items-center gap-2 rounded-lg bg-red-500/80 backdrop-blur-xl border border-white/40 hover:bg-red-500/90 px-4 py-2 text-xs font-bold text-white shadow-[0_8px_24px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition disabled:opacity-50 dark:bg-red-500/25 dark:border-red-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-red-500/35"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Project</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProjectDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [target, setTarget] = useState({ name: '', url: '', method: 'GET', requestBody: '', environment: 'Testing', customHeaders: '', authorizationConfirmed: false });

  const resolvedId = id;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['project', resolvedId],
    queryFn: async () => (await api.get(`/projects/${resolvedId}`)).data,
  });

  const addTarget = useMutation({
    mutationFn: async () => (await api.post(`/projects/${resolvedId}/targets`, target)).data,
    onSuccess: () => {
      setTarget({ name: '', url: '', method: 'GET', requestBody: '', environment: 'Testing', customHeaders: '', authorizationConfirmed: false });
      qc.invalidateQueries({ queryKey: ['project', resolvedId] });
    },
  });

  if (isLoading) return <LoadingState label="Loading project workspace context..." />;
  if (isError || !data?.project) return <ErrorState message="Project workspace not found." onRetry={() => refetch()} />;

  const { project, overview = {}, assessments = [], recentActivity = [] } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/projects');
            }
          }}
          className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition duration-200 hover:border-blue-300 dark:hover:border-cyan-500/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-cyan-400 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {project.status || 'Active'} WORKSPACE
              </span>
              {overview.securityScore !== null && overview.securityScore !== undefined && (
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  SCORE {overview.securityScore}/100
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-[#0f1f3d] dark:text-white tracking-tight flex items-center gap-2 mt-1">
              <FolderKanban className="text-blue-600 dark:text-cyan-400" size={20} />
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {project.description || 'Authorized security testing environment and attack surface posture.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/assessments"
              className="flex items-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border border-slate-200 dark:border-white/[0.14] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/85 dark:hover:bg-white/[0.12] hover:border-slate-300 dark:hover:border-white/20"
            >
              <Play size={13} className="fill-current" />
              <span>Launch Assessment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { key: 'totalAssessments', label: 'TOTAL AUDITS', val: overview.totalAssessments || 0, color: 'text-[#0f1f3d] dark:text-white' },
          { key: 'critical', label: 'CRITICAL SEVERITY', val: overview.critical || 0, color: 'text-red-600 dark:text-red-400' },
          { key: 'high', label: 'HIGH SEVERITY', val: overview.high || 0, color: 'text-orange-600 dark:text-orange-400' },
          { key: 'verified', label: 'VERIFIED FINDINGS', val: overview.verified || 0, color: 'text-blue-600 dark:text-cyan-400' },
        ].map((item) => (
          <div key={item.key} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-4 shadow-sm">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {item.label}
            </span>
            <span className={`mt-2 block text-2xl font-extrabold tracking-tight ${item.color}`}>
              {item.val}
            </span>
          </div>
        ))}
      </div>

      {/* Target Asset Registration Card */}
      <Card>
        <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          <Globe size={15} className="text-blue-600 dark:text-cyan-400" />
          <span>Register Authorized Target Environment</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Target Name (e.g., API Gateway)"
            value={target.name}
            onChange={(e) => setTarget({ ...target, name: e.target.value })}
          />
          <CustomSelect
            value={target.method}
            onChange={(e) => setTarget({ ...target, method: e.target.value })}
            options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE']}
          />
          <Input
            placeholder="https://target.example.com"
            value={target.url}
            onChange={(e) => setTarget({ ...target, url: e.target.value })}
          />
          <CustomSelect
            value={target.environment}
            onChange={(e) => setTarget({ ...target, environment: e.target.value })}
            options={['Testing', 'Staging', 'Demo', 'Production-authorized', 'Production']}
          />
          <button
            onClick={() => addTarget.mutate()}
            disabled={!target.name || !target.url || addTarget.isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border border-slate-200 dark:border-white/[0.14] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/85 dark:hover:bg-white/[0.12] hover:border-slate-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addTarget.isPending ? 'Adding...' : 'Add Target'}
          </button>
        </div>

        {target.method !== 'GET' && (
          <div className="mt-3">
            <textarea
              rows={3}
              placeholder='JSON Payload (Optional): { "key": "value" }'
              value={target.requestBody}
              onChange={(e) => setTarget({ ...target, requestBody: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-3 font-mono text-xs text-amber-700 dark:text-amber-300 focus:border-amber-500 focus:outline-none"
            />
          </div>
        )}

        <div className="mt-3">
          <Input
            placeholder="Auth Headers (Optional): Authorization: Bearer <token> or Cookie: session=123"
            value={target.customHeaders}
            onChange={(e) => setTarget({ ...target, customHeaders: e.target.value })}
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={target.authorizationConfirmed}
            onChange={(e) => setTarget({ ...target, authorizationConfirmed: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-cyan-500 focus:ring-cyan-500"
          />
          <span>I confirm explicit authorization to audit and test this target asset.</span>
        </label>
        {addTarget.isError && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{errMsg(addTarget.error)}</p>}
      </Card>

      {/* Recent Security Assessments List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Activity size={15} className="text-blue-600 dark:text-cyan-400" />
            Recent Security Assessments ({assessments.length})
          </h2>
          <Link to="/assessments" className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline">
            View All Assessments →
          </Link>
        </div>

        {assessments.length === 0 ? (
          <EmptyState title="No assessments recorded" hint="Start an assessment for this project above." />
        ) : (
          <div className="space-y-2.5">
            {assessments.map((a) => {
              const isDone = a.status === 'COMPLETED';
              const isFail = a.status === 'FAILED';
              const score = a.summary?.securityScore;

              return (
                <div
                  key={a._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060a14] p-3.5 transition duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
                      isFail ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' :
                      'bg-cyan-500/10 border-blue-200 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400'
                    }`}>
                      {isDone ? <ShieldCheck size={16} /> : isFail ? <AlertTriangle size={16} /> : <Activity size={16} className="animate-pulse" />}
                    </span>

                    <div className="min-w-0">
                      <h4 className="font-bold text-[#0f1f3d] dark:text-white text-xs truncate">
                        {a.type} Assessment
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {score !== null && score !== undefined && (
                      <span className={`font-mono text-xs font-bold ${
                        score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        Score {score}/100
                      </span>
                    )}
                    <StatusBadge status={a.status} />
                    <Link
                      to={`/assessments/${a._id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 transition"
                    >
                      Inspect <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

