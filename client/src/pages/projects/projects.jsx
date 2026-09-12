import { useState, useEffect } from 'react';
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
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';
import { CustomSelect } from '../../components/ui/CustomSelect';

export function Projects() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'Active', tags: 'Web Application', image: '' });

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
      setForm({ name: '', description: '', status: 'Active', tags: 'Web Application', image: '' });
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

  // Default mock projects if API returns empty list for demo preview
  const defaultProjects = [
    {
      _id: 'proj_1',
      name: 'claude',
      status: 'Active',
      description: 'Security assessment for claude',
      tags: ['Web Application', 'API', 'Reconnaissance'],
      avatarBg: 'bg-cyan-600',
      avatarChar: 'C',
      targets: { count: 1, sample: 'claude.ai' },
      assessments: { total: 4, completed: 2 },
      findings: { total: 12, critical: 1, high: 5, medium: 3, low: 3 },
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: '2026-09-12T15:20:00Z',
    },
    {
      _id: 'proj_2',
      name: 'World Monitor Project',
      status: 'Active',
      description: 'Security assessment for World Monitor Service',
      tags: ['Web Application', 'Monitoring', 'External'],
      avatarBg: 'bg-purple-600',
      avatarChar: 'W',
      targets: { count: 2, sample: 'worldmonitor.com +1 more' },
      assessments: { total: 3, completed: 1 },
      findings: { total: 8, critical: 0, high: 3, medium: 3, low: 2 },
      createdAt: '2026-09-08T14:30:00Z',
      updatedAt: '2026-09-12T11:15:00Z',
    },
    {
      _id: 'proj_3',
      name: 'djfbjher',
      status: 'Active',
      description: 'Internal infrastructure and target scanning container',
      tags: ['API', 'Testing', 'Internal'],
      avatarBg: 'bg-emerald-600',
      avatarChar: 'D',
      targets: { count: 1, sample: 'internal' },
      assessments: { total: 1, completed: 0 },
      findings: { total: 3, critical: 0, high: 1, medium: 1, low: 1 },
      createdAt: '2026-09-05T09:10:00Z',
      updatedAt: '2026-09-12T10:00:00Z',
    },
  ];

  const fetchedProjects = data?.projects || [];
  const rawProjectsList = fetchedProjects.length > 0
    ? fetchedProjects.map((p, idx) => ({
        ...p,
        tags: p.tags || ['Web Application', 'API'],
        avatarBg: idx % 3 === 0 ? 'bg-cyan-600' : idx % 3 === 1 ? 'bg-purple-600' : 'bg-emerald-600',
        avatarChar: (p.name || 'P').charAt(0).toUpperCase(),
        targets: p.targets || { count: 1, sample: p.name ? `${p.name.toLowerCase()}.com` : 'target.com' },
        assessments: p.assessments || { total: 2, completed: 1 },
        findings: p.findings || { total: 5, critical: 0, high: 2, medium: 2, low: 1 },
      }))
    : defaultProjects;

  // Filter projects dynamically
  const filteredProjects = rawProjectsList.filter((p) => {
    const matchSearch =
      !filters.search ||
      p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = !filters.status || p.status.toLowerCase() === filters.status.toLowerCase();
    const matchType =
      !filters.type || p.tags.some((t) => t.toLowerCase().includes(filters.type.toLowerCase()));
    return matchSearch && matchStatus && matchType;
  });

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
          title="Security Projects"
          subtitle="Workspace containers for multi-target security auditing and attack surface management."
        />

        {/* Feature Banner Card */}
        <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900 p-3.5 shadow-lg backdrop-blur shrink-0 max-w-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20 text-cyan-300">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Organize. Assess. Secure.</h4>
            <p className="text-[11px] text-slate-400">
              Create projects, run assessments, and manage your attack surface in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Top Executive Metric Summary Cards (4 Columns) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Projects */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <FolderKanban className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">+1 this month</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{totalCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Total Projects</p>
          </div>
          {/* Cyan Mini Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,20 Q 25,10 50,15 T 100,5" fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 2: Active Projects */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Play className="h-4 w-4 fill-current" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              {Math.round((activeCount / (totalCount || 1)) * 100)}% of total
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{activeCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Active Projects</p>
          </div>
          {/* Green Mini Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,18 Q 30,22 60,10 T 100,8" fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 3: Completed */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-semibold">
              {Math.round((completedCount / (totalCount || 1)) * 100)}% of total
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{completedCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Completed</p>
          </div>
          {/* Blue Mini Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <path d="M 0,15 Q 40,5 70,18 T 100,10" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </Card>

        {/* Card 4: Paused */}
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">0% of total</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{pausedCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Paused</p>
          </div>
          {/* Yellow Flat Sparkline */}
          <div className="mt-2 h-6 w-full opacity-60">
            <svg className="h-full w-full" viewBox="0 0 100 25">
              <line x1="0" y1="15" x2="100" y2="15" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar & Actions Bar */}
      <Card className="relative z-30 border-slate-800 bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects by name, description, or target..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-slate-700/80 bg-slate-950/80 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
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
              className="flex items-center gap-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm border border-cyan-400/30"
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
            filteredProjects.map((p) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/90 p-4 transition duration-200 hover:border-slate-700 hover:bg-slate-800/80 shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Column 1: Identity & Header */}
                  <div className="flex items-start gap-3 flex-1 min-w-[220px]">
                    {p.image || p.avatarUrl ? (
                      <img
                        src={p.image || p.avatarUrl}
                        alt={p.name}
                        className="h-11 w-11 shrink-0 rounded-xl object-cover border border-cyan-500/40 shadow-sm ring-1 ring-cyan-500/20"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/30 text-cyan-400 font-extrabold text-base shadow-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/projects/${p._id}`}
                          className="font-bold text-white text-sm hover:text-cyan-300 transition"
                        >
                          {p.name}
                        </Link>
                        <StatusBadge status={p.status || 'Active'} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {p.description || `Security assessment scope for ${p.name}`}
                      </p>
                      {/* Tags Pill */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {(Array.isArray(p.tags) ? p.tags : [p.tags || 'Web Application']).map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded border border-slate-800 bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Target Stats */}
                  <div className="min-w-[140px] text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      <Globe className="h-3.5 w-3.5 text-cyan-400" />
                      <span>TARGETS</span>
                    </div>
                    <div className="mt-1 font-mono font-bold text-white text-sm">
                      {p.targetCount || 1}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                      {p.targetUrl || 'world-monitor.app'}
                    </div>
                  </div>

                  {/* Column 3: Assessments Count */}
                  <div className="min-w-[130px] text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      <Activity className="h-3.5 w-3.5 text-blue-400" />
                      <span>ASSESSMENTS</span>
                    </div>
                    <div className="mt-1 font-mono font-bold text-white text-sm">
                      {p.assessmentCount || 2}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {p.completedAssessments || 1} completed
                    </div>
                  </div>

                  {/* Column 4: Findings Breakdown */}
                  <div className="min-w-[140px] text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      <span>FINDINGS</span>
                    </div>
                    <div className="mt-1 font-mono font-bold text-white text-sm">
                      {p.findingCount || 5}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                      <span className="flex items-center gap-0.5 text-red-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {p.findings?.critical || 0}
                      </span>
                      <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> {p.findings?.high || 2}
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {p.findings?.medium || 2}
                      </span>
                      <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {p.findings?.low || 1}
                      </span>
                    </div>
                  </div>

                  {/* Column 5: Timestamps */}
                  <div className="min-w-[120px] text-xs text-slate-400 font-mono">
                    <div className="text-[10px] text-slate-500">Created</div>
                    <div className="text-[11px] text-slate-300">
                      {new Date(p.createdAt || Date.now()).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Last Updated</div>
                    <div className="text-[11px] text-slate-300">
                      {new Date(p.updatedAt || Date.now()).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Column 6: Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/projects/${p._id}`}
                      className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      Open Project <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuProjectId((prev) => (prev === p._id ? null : p._id));
                        }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        title="Project actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuProjectId === p._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-slate-800 bg-[#090f1f] p-1 shadow-2xl backdrop-blur-md"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuProjectId(null);
                              setEditProject({
                                _id: p._id,
                                name: p.name,
                                description: p.description || '',
                                status: p.status || 'Active',
                                tags: Array.isArray(p.tags) ? p.tags[0] || 'Web Application' : p.tags || 'Web Application',
                              });
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                          >
                            <Pencil className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Edit Project</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuProjectId(null);
                              setDeleteProject(p);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
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
      <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400 font-mono">
        <span>Showing 1-{filteredProjects.length} of {rawProjectsList.length} projects</span>
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
              className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Create New Security Project</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Project Name *</label>
                  <Input
                    placeholder="e.g. World Monitor Project or Sentinel Gateway"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Description / Scope</label>
                  <Input
                    placeholder="Security assessment scope and target container info"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Project Logo / Image Uploader */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Project Logo / Image</label>
                  <div className="flex items-center gap-3">
                    {form.image ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-900 group shadow-md">
                        <img src={form.image} alt="Project Logo" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: '' })}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 opacity-0 group-hover:opacity-100 transition text-red-400 font-semibold text-[10px]"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4 mb-0.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900 transition text-slate-400 hover:text-cyan-400">
                        <Camera className="h-5 w-5" />
                        <span className="text-[9px] font-mono mt-0.5 font-semibold">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
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
                        Click 'Upload' to pick an image file or paste an image URL.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Initial Status</label>
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
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Project Category</label>
                    <CustomSelect
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
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
                <p className="text-xs font-semibold text-red-400">{errMsg(createMutation.error)}</p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!form.name || createMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white"
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
              className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Edit Security Project</h3>
                </div>
                <button
                  onClick={() => setEditProject(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Project Name *</label>
                  <Input
                    placeholder="e.g. World Monitor Project"
                    value={editProject.name}
                    onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Description / Scope</label>
                  <Input
                    placeholder="Security assessment scope and target container info"
                    value={editProject.description}
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  />
                </div>

                {/* Project Logo / Image Uploader */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Project Logo / Image</label>
                  <div className="flex items-center gap-3">
                    {editProject.image ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-900 group shadow-md">
                        <img src={editProject.image} alt="Project Logo" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditProject({ ...editProject, image: '' })}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 opacity-0 group-hover:opacity-100 transition text-red-400 font-semibold text-[10px]"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4 mb-0.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900 transition text-slate-400 hover:text-cyan-400">
                        <Camera className="h-5 w-5" />
                        <span className="text-[9px] font-mono mt-0.5 font-semibold">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
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
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Status</label>
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
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                    <CustomSelect
                      value={editProject.tags}
                      onChange={(e) => setEditProject({ ...editProject, tags: e.target.value })}
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
                <p className="text-xs font-semibold text-red-400">{errMsg(updateMutation.error)}</p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
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
                        tags: [editProject.tags],
                        image: editProject.image,
                      },
                    })
                  }
                  disabled={!editProject.name || updateMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white"
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
              className="relative w-full max-w-md rounded-xl border border-red-500/30 bg-slate-950 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Security Project?</h3>
                  <p className="text-xs text-slate-400">This action is permanent and cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete <strong className="text-white font-semibold">{deleteProject.name}</strong>?
                All associated target scopes, vulnerability findings, and assessment logs for this project will be permanently removed.
              </p>

              {deleteMutation.isError && (
                <p className="text-xs font-semibold text-red-400">{errMsg(deleteMutation.error)}</p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteProject(null)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(deleteProject._id)}
                  className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
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
  const [target, setTarget] = useState({ name: '', url: '', environment: 'Testing', customHeaders: '', authorizationConfirmed: false });

  const resolvedId = id;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['project', resolvedId],
    queryFn: async () => (await api.get(`/projects/${resolvedId}`)).data,
  });

  const addTarget = useMutation({
    mutationFn: async () => (await api.post(`/projects/${resolvedId}/targets`, target)).data,
    onSuccess: () => {
      setTarget({ name: '', url: '', environment: 'Testing', customHeaders: '', authorizationConfirmed: false });
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
          className="group inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-300 transition duration-200 hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-cyan-400 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-slate-700">
                {project.status || 'Active'} WORKSPACE
              </span>
              {overview.securityScore !== null && overview.securityScore !== undefined && (
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
                  SCORE {overview.securityScore}/100
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              <FolderKanban className="text-cyan-400" size={20} />
              {project.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {project.description || 'Authorized security testing environment and attack surface posture.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/assessments"
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white transition shadow-sm border border-cyan-400/30"
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
          { key: 'totalAssessments', label: 'TOTAL AUDITS', val: overview.totalAssessments || 0, color: 'text-white' },
          { key: 'critical', label: 'CRITICAL SEVERITY', val: overview.critical || 0, color: 'text-red-400' },
          { key: 'high', label: 'HIGH SEVERITY', val: overview.high || 0, color: 'text-orange-400' },
          { key: 'verified', label: 'VERIFIED FINDINGS', val: overview.verified || 0, color: 'text-cyan-400' },
        ].map((item) => (
          <div key={item.key} className="rounded-xl border border-slate-800 bg-[#090f1f] p-4 shadow-sm">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
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
        <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          <Globe size={15} className="text-cyan-400" />
          <span>Register Authorized Target Environment</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Target Name (e.g., API Gateway)"
            value={target.name}
            onChange={(e) => setTarget({ ...target, name: e.target.value })}
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
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition disabled:opacity-50 border border-cyan-400/30 shadow-sm px-4 py-2"
          >
            {addTarget.isPending ? 'Adding...' : 'Add Target'}
          </button>
        </div>

        <div className="mt-3">
          <Input
            placeholder="Auth Headers (Optional): Authorization: Bearer <token> or Cookie: session=123"
            value={target.customHeaders}
            onChange={(e) => setTarget({ ...target, customHeaders: e.target.value })}
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={target.authorizationConfirmed}
            onChange={(e) => setTarget({ ...target, authorizationConfirmed: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
          />
          <span>I confirm explicit authorization to audit and probe this target asset.</span>
        </label>
        {addTarget.isError && <p className="mt-2 text-xs font-semibold text-red-400">{errMsg(addTarget.error)}</p>}
      </Card>

      {/* Recent Security Assessments List */}
      <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity size={15} className="text-cyan-400" />
            Recent Security Assessments ({assessments.length})
          </h2>
          <Link to="/assessments" className="text-xs font-bold text-cyan-400 hover:underline">
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-[#060a14] p-3.5 transition duration-150 hover:border-slate-700 hover:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      isFail ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}>
                      {isDone ? <ShieldCheck size={16} /> : isFail ? <AlertTriangle size={16} /> : <Activity size={16} className="animate-pulse" />}
                    </span>

                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">
                        {a.type} Assessment
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {score !== null && score !== undefined && (
                      <span className={`font-mono text-xs font-bold ${
                        score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        Score {score}/100
                      </span>
                    )}
                    <StatusBadge status={a.status} />
                    <Link
                      to={`/assessments/${a._id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition"
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

