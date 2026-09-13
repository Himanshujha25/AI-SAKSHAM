import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText,
  Activity as ActivityIcon,
  Zap,
  CheckCircle2,
  ShieldCheck,
  FileText,
  FolderKanban,
  User,
  Clock,
  Search,
  X,
  ChevronRight,
} from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/shared/shared';
import { Card } from '../../components/ui/primitives';
import { CustomSelect } from '../../components/ui/CustomSelect';

export function Activity() {
  const [projectId, setProjectId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const projectsQuery = useQuery({
    queryKey: ['projects-mini'],
    queryFn: async () => (await api.get('/projects')).data,
  });

  const qs = projectId ? `?projectId=${projectId}&limit=200` : '?limit=200';
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: async () => (await api.get(`/activity${qs}`)).data,
  });

  const rawEvents = data?.events || [];

  // Helper to categorize action
  const getEventCategory = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('assessment') || act.includes('scan')) return 'Assessment';
    if (act.includes('finding') || act.includes('vulnerability') || act.includes('verif')) return 'Verification';
    if (act.includes('report')) return 'Report';
    if (act.includes('project')) return 'Project';
    if (act.includes('ai') || act.includes('analysis')) return 'AI';
    return 'System';
  };

  // Helper to get styled badge & icon config
  const getEventStyle = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('completed')) {
      return {
        icon: CheckCircle2,
        badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        dotBg: 'bg-emerald-500 shadow-[0_0_12px_2px_rgba(16,185,129,0.5)]',
        category: 'Scan Completed',
      };
    }
    if (act.includes('started') || act.includes('queued')) {
      return {
        icon: Zap,
        badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
        dotBg: 'bg-cyan-500 shadow-[0_0_12px_2px_rgba(56,189,248,0.5)]',
        category: 'Scan Execution',
      };
    }
    if (act.includes('report')) {
      return {
        icon: FileText,
        badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
        dotBg: 'bg-purple-500 shadow-[0_0_12px_2px_rgba(168,85,247,0.5)]',
        category: 'Report Generation',
      };
    }
    if (act.includes('project')) {
      return {
        icon: FolderKanban,
        badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        dotBg: 'bg-blue-500 shadow-[0_0_12px_2px_rgba(59,130,246,0.5)]',
        category: 'Project Workspace',
      };
    }
    if (act.includes('finding') || act.includes('verified')) {
      return {
        icon: ShieldCheck,
        badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        dotBg: 'bg-amber-500 shadow-[0_0_12px_2px_rgba(245,158,11,0.5)]',
        category: 'Security Verification',
      };
    }
    return {
      icon: ActivityIcon,
      badgeColor: 'border-slate-700 bg-slate-800 text-slate-300',
      dotBg: 'bg-slate-400 shadow-[0_0_10px_1px_rgba(148,163,184,0.4)]',
      category: 'System Audit',
    };
  };

  // Filter events dynamically
  const filteredEvents = useMemo(() => {
    return rawEvents.filter((e) => {
      const matchProject = !projectId || String(e.projectId?._id || e.projectId) === String(projectId);
      const category = getEventCategory(e.action);
      const matchCategory = !categoryFilter || category.toLowerCase() === categoryFilter.toLowerCase();
      const search = searchQuery.toLowerCase().trim();
      const matchSearch =
        !search ||
        e.action.toLowerCase().includes(search) ||
        (e.detail || '').toLowerCase().includes(search) ||
        (e.actor?.name || '').toLowerCase().includes(search) ||
        (e.projectId?.name || '').toLowerCase().includes(search);
      return matchProject && matchCategory && matchSearch;
    });
  }, [rawEvents, projectId, categoryFilter, searchQuery]);

  // Compute Summary Metrics
  const metrics = useMemo(() => {
    const total = rawEvents.length;
    const scans = rawEvents.filter((e) => getEventCategory(e.action) === 'Assessment').length;
    const reports = rawEvents.filter((e) => getEventCategory(e.action) === 'Report').length;
    const projectsCount = rawEvents.filter((e) => getEventCategory(e.action) === 'Project').length;
    return { total, scans, reports, projectsCount };
  }, [rawEvents]);

  const projectsList = projectsQuery.data?.projects || [];

  return (
    <div className="relative min-h-screen pb-16 space-y-6">
      {/* Header */}
      <PageHeader
        title="Activity Audit Trail"
        subtitle="Real-time timeline of assessment executions, target probes, findings verifications, and report exports."
      />

      {/* Top Executive Metric Summary Cards (4 Columns) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <ScrollText size={16} />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">ALL LOGS</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{metrics.total}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Logged Events</p>
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Zap size={16} />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">AUDITS</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{metrics.scans}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Scans Executed</p>
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400">
              <FileText size={16} />
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-semibold">REPORTS</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{metrics.reports}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Reports Exported</p>
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <FolderKanban size={16} />
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-semibold">WORKSPACES</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{metrics.projectsCount}</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Project Operations</p>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar Card */}
      <Card className="relative z-20 border-slate-800 bg-slate-900/90 p-4 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search audit trail by action, detail, user, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-700/80 bg-slate-950/80 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <CustomSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-44"
              options={[
                { value: '', label: 'All Event Types' },
                { value: 'Assessment', label: 'Security Audits' },
                { value: 'Verification', label: 'Verifications' },
                { value: 'Report', label: 'Report Exports' },
                { value: 'Project', label: 'Project Operations' },
              ]}
            />

            <CustomSelect
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-48"
              options={[
                { value: '', label: 'All Projects' },
                ...projectsList.map((p) => ({ value: p._id, label: p.name })),
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Audit Feed Status States */}
      {isLoading && <LoadingState label="Loading detailed audit trail events..." />}
      {isError && <ErrorState message="Could not load security activity log." onRetry={() => refetch()} />}

      {!isLoading && !isError && filteredEvents.length === 0 && (
        <EmptyState title="No matching activity events found" hint="Try adjusting your project or search filter." />
      )}

      {/* Main Audit Feed Timeline */}
      {!isLoading && !isError && filteredEvents.length > 0 && (
        <div className="relative space-y-4 pl-6 before:absolute before:left-3.5 before:top-3 before:h-[calc(100%-1.5rem)] before:w-0.5 before:bg-slate-800">
          {filteredEvents.map((e) => {
            const style = getEventStyle(e.action);
            const Icon = style.icon;
            const projectObj = typeof e.projectId === 'object' ? e.projectId : null;
            const projName = projectObj?.name || 'Project Workspace';
            const actorName = e.actor?.name || 'Automated Security Scanner';
            const actorRole = e.actor?.role ? e.actor.role.toUpperCase() : 'SYSTEM';

            return (
              <div key={e._id} className="relative group">
                {/* Glowing Node Dot */}
                <span className={`absolute -left-6 top-4 flex h-5 w-5 items-center justify-center rounded-full ${style.dotBg} transition-transform duration-200 group-hover:scale-125 z-10`}>
                  <Icon size={10} className="text-slate-950 font-bold" />
                </span>

                {/* Card Container */}
                <div
                  onClick={() => setSelectedEvent(e)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-[#090f1f]/90 p-4 shadow-sm transition duration-200 hover:border-cyan-500/40 hover:bg-slate-900 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Event Category Badge */}
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${style.badgeColor}`}>
                          <Icon size={11} />
                          {e.action}
                        </span>

                        {/* Project Workspace Pill */}
                        {projectObj && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-300">
                            <FolderKanban size={10} className="text-cyan-400" />
                            {projName}
                          </span>
                        )}
                      </div>

                      {/* Detail Message */}
                      <p className="text-sm font-semibold text-slate-100 leading-snug">
                        {e.detail || e.action}
                      </p>

                      {/* Detailed Meta Sub-row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <User size={12} className="text-cyan-400" />
                          {actorName}
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-slate-400 border border-slate-700">
                            {actorRole}
                          </span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock size={12} className="text-slate-500" />
                          {new Date(e.createdAt).toLocaleDateString('en-GB')} at {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* View Details Indicator */}
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-500 transition group-hover:text-cyan-400">
                      <span>Inspect Event</span>
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Activity Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-800 bg-[#091024] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
                  <ActivityIcon className="text-cyan-400" size={18} />
                  Security Event Audit Record
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Action Identifier</span>
                  <span className="text-cyan-400 font-bold text-sm">{selectedEvent.action}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Execution Detail</span>
                  <span className="text-slate-200">{selectedEvent.detail || 'No extra detail provided.'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Actor / Trigger</span>
                    <span className="text-slate-300 font-bold">{selectedEvent.actor?.name || 'System / Auto-Scanner'}</span>
                    <span className="block text-[9px] text-slate-500">{selectedEvent.actor?.role || 'SYSTEM_RUNNER'}</span>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Timestamp</span>
                    <span className="text-slate-300 font-bold">{new Date(selectedEvent.createdAt).toLocaleDateString()}</span>
                    <span className="block text-[9px] text-slate-500">{new Date(selectedEvent.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {selectedEvent.projectId && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Project Scope</span>
                    <span className="text-cyan-300 font-bold">
                      {typeof selectedEvent.projectId === 'object' ? selectedEvent.projectId.name : selectedEvent.projectId}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
