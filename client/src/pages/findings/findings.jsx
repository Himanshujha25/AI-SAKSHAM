import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Search,
  Filter,
  X,
  ExternalLink,
  ChevronRight,
  Clock,
  Code2,
  FileText,
  Activity,
  Layers,
  Calendar,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronLeft,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';
import api from '../../lib/api';
import { errMsg, cn } from '../../lib/utils';
import CustomSelect from '../../components/ui/CustomSelect';
import { PageHeader, LoadingState, ErrorState, EmptyState, SeverityBadge, StatusBadge } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';

function formatDateTime(val) {
  if (!val) val = new Date().toISOString();
  const d = new Date(val);
  const valid = !isNaN(d.getTime()) ? d : new Date();
  return {
    date: valid.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: valid.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    full: valid.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function Findings() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    project: '',
    asset: '',
    dateRange: 'all',
    sort: 'newest',
    search: '',
  });

  // Selected finding for the right slide-over drawer
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details'); // 'details' | 'evidence' | 'remediation' | 'timeline'
  const [toastMessage, setToastMessage] = useState({ show: true, id: 'VUL-003', text: 'Finding verified successfully' });

  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, val]) => val !== '' && val !== 'all')
    )
  ).toString();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['findings', queryString],
    queryFn: async () => (await api.get(`/findings?${queryString}`)).data,
  });

  const fetchedFindings = data?.findings || [];
  const defaultFindings = [
    {
      _id: '1',
      findingId: 'VUL-003',
      title: 'Broken Access Control',
      description: 'Improper access control allows unauthorized access to protected resources.',
      severity: 'High',
      cvssScore: 8.1,
      affectedAssets: ['/api/assets'],
      httpMethod: 'GET',
      project: 'SahakarGig',
      technology: 'Node.js (Express)',
      cweId: 'CWE-862',
      owaspCategory: 'A01:2021',
      status: 'Verified',
      detectedDate: '2026-09-12T14:32:00Z',
      updatedDate: '2026-09-12T15:08:00Z',
      firstSeen: '2026-09-10T11:23:00Z',
      lastSeen: '2026-09-12T15:08:00Z',
      evidence: 'GET /api/assets HTTP/1.1\nHost: target.com\nAuthorization: Bearer unprivileged_user_token\n\nHTTP/1.1 200 OK\n[{"id":"admin_secret_asset_99"}]',
      remediation: ['Implement role-based authorization check middleware on GET /api/assets.', 'Enforce tenant isolation on resource queries.'],
    },
    {
      _id: '2',
      findingId: 'VUL-004',
      title: 'Missing Security Header (CSP)',
      description: 'Content Security Policy header is not present on login page.',
      severity: 'Medium',
      cvssScore: 5.4,
      affectedAssets: ['/login'],
      httpMethod: 'GET',
      project: 'Sentinel AI',
      technology: 'React / Vite',
      cweId: 'CWE-693',
      owaspCategory: 'A05:2021',
      status: 'Under Review',
      detectedDate: '2026-09-12T12:00:00Z',
      updatedDate: '2026-09-12T12:10:00Z',
      firstSeen: '2026-09-12T12:00:00Z',
      lastSeen: '2026-09-12T12:10:00Z',
      evidence: 'Response headers missing Content-Security-Policy header.',
      remediation: ['Add Content-Security-Policy header to web server response headers.'],
    },
    {
      _id: '3',
      findingId: 'VUL-005',
      title: 'Verbose Error Message',
      description: 'Unhandled error response exposes internal stack trace.',
      severity: 'Low',
      cvssScore: 3.2,
      affectedAssets: ['/auth'],
      httpMethod: 'POST',
      project: 'Main Target',
      technology: 'Node.js',
      cweId: 'CWE-209',
      owaspCategory: 'A04:2021',
      status: 'Potential',
      detectedDate: '2026-09-11T10:45:00Z',
      updatedDate: '2026-09-11T10:45:00Z',
      firstSeen: '2026-09-11T10:45:00Z',
      lastSeen: '2026-09-11T10:45:00Z',
      evidence: '500 Internal Server Error: Error at /app/server.js:42:10',
      remediation: ['Sanitize error messages in production environment.'],
    },
    {
      _id: '4',
      findingId: 'VUL-002',
      title: 'Insecure Direct Object Reference',
      description: 'IDOR vulnerability in user profile access route.',
      severity: 'High',
      cvssScore: 7.3,
      affectedAssets: ['/api/profile'],
      httpMethod: 'GET',
      project: 'SahakarGig',
      technology: 'Express.js',
      cweId: 'CWE-639',
      owaspCategory: 'A01:2021',
      status: 'Open',
      detectedDate: '2026-09-11T13:15:00Z',
      updatedDate: '2026-09-11T13:15:00Z',
      firstSeen: '2026-09-11T13:15:00Z',
      lastSeen: '2026-09-11T13:15:00Z',
      evidence: 'GET /api/profile?userId=102 returns profile of admin user 102.',
      remediation: ['Verify user session ID against requested profile ID.'],
    },
    {
      _id: '5',
      findingId: 'VUL-006',
      title: 'Outdated Dependency',
      description: 'Vulnerable library version detected in package.json.',
      severity: 'Low',
      cvssScore: 2.3,
      affectedAssets: ['package.json'],
      httpMethod: 'N/A',
      project: 'SahakarGig',
      technology: 'npm / Node',
      cweId: 'CWE-1104',
      owaspCategory: 'A06:2021',
      status: 'Verified',
      detectedDate: '2026-09-10T09:20:00Z',
      updatedDate: '2026-09-12T09:30:00Z',
      firstSeen: '2026-09-10T09:20:00Z',
      lastSeen: '2026-09-12T09:30:00Z',
      evidence: 'axios@0.21.1 has known vulnerability CVE-2021-3749.',
      remediation: ['Upgrade package to latest safe release version.'],
    },
    {
      _id: '6',
      findingId: 'VUL-007',
      title: 'SQL Injection (Potential)',
      description: 'Raw SQL input not sanitized in search endpoint.',
      severity: 'Critical',
      cvssScore: 9.1,
      affectedAssets: ['/search'],
      httpMethod: 'POST',
      project: 'Sentinel AI',
      technology: 'PostgreSQL',
      cweId: 'CWE-89',
      owaspCategory: 'A03:2021',
      status: 'Open',
      detectedDate: '2026-09-10T09:20:00Z',
      updatedDate: '2026-09-10T09:20:00Z',
      firstSeen: '2026-09-10T09:20:00Z',
      lastSeen: '2026-09-10T09:20:00Z',
      evidence: "POST /search payload q=1' OR '1'='1 returns all database rows.",
      remediation: ['Use parameterized queries or ORM bindings.'],
    },
  ];

  const hasFetched = Array.isArray(data?.findings);
  const findingsList = hasFetched
    ? (data.findings.length > 0
        ? data.findings.map((f) => ({
            ...f,
            detectedDate: f.detectedDate || f.createdAt || new Date().toISOString(),
            updatedDate: f.updatedDate || f.updatedAt || f.createdAt || new Date().toISOString(),
            firstSeen: f.firstSeen || f.createdAt || new Date().toISOString(),
            lastSeen: f.lastSeen || f.updatedAt || f.createdAt || new Date().toISOString(),
          }))
        : [])
    : defaultFindings;

  // Calculate stats dynamically
  const totalCount = findingsList.length;
  const criticalCount = findingsList.filter((x) => x.severity === 'Critical').length;
  const highCount = findingsList.filter((x) => x.severity === 'High').length;
  const mediumCount = findingsList.filter((x) => x.severity === 'Medium').length;
  const lowCount = findingsList.filter((x) => x.severity === 'Low').length;
  const verifiedCount = findingsList.filter((x) => x.status === 'Verified' || x.status === 'Resolved').length;

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }) => (await api.post(`/findings/${id}/verify`, { status, confidence: 95 })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['findings'] });
      qc.invalidateQueries({ queryKey: ['finding'] });
    },
  });

  const handleClearFilters = () => {
    setFilters({
      severity: '',
      status: '',
      project: '',
      asset: '',
      dateRange: 'all',
      sort: 'newest',
      search: '',
    });
  };

  return (
    <div className="relative min-h-screen pb-16 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Findings"
        subtitle="Vulnerabilities with evidence, verification, CVSS and analysis"
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            <span>Sep 6, 2026 – Sep 12, 2026</span>
          </div>
        }
      />

      {/* Top Row: Executive Metric Summary Cards (6 Columns) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard title="Total findings" value={totalCount} trend="+2 today" icon={Shield} color="cyan" />
        <MetricCard title="Critical" value={criticalCount} trend="+1" icon={AlertOctagon} color="red" badgeColor="bg-red-500" />
        <MetricCard title="High" value={highCount} trend="-2" icon={AlertTriangle} color="orange" badgeColor="bg-orange-500" />
        <MetricCard title="Medium" value={mediumCount} trend="+1" icon={Activity} color="amber" badgeColor="bg-amber-500" />
        <MetricCard title="Low" value={lowCount} trend="-1" icon={Info} color="green" badgeColor="bg-emerald-500" />
        <MetricCard
          title="Verified"
          value={verifiedCount}
          trend={`${Math.round((verifiedCount / (totalCount || 1)) * 100)}% resolved`}
          icon={CheckCircle2}
          color="emerald"
          badgeColor="bg-cyan-500"
        />
      </div>

      {/* Middle Row: Analytics Modules (3 Columns) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 1. Findings by Severity Bar Breakdown */}
        <Card className="flex flex-col justify-between border-slate-800 bg-slate-900/90 p-4">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Findings by Severity</h3>
              <span className="text-[11px] text-slate-500">Live Breakdown</span>
            </div>
            <div className="space-y-3 pt-1">
              <SeverityProgressBar label="Critical" count={criticalCount} total={totalCount} color="bg-red-500" text="text-red-400" />
              <SeverityProgressBar label="High" count={highCount} total={totalCount} color="bg-orange-500" text="text-orange-400" />
              <SeverityProgressBar label="Medium" count={mediumCount} total={totalCount} color="bg-amber-500" text="text-amber-400" />
              <SeverityProgressBar label="Low" count={lowCount} total={totalCount} color="bg-emerald-500" text="text-emerald-400" />
            </div>
          </div>
        </Card>

        {/* 2. Findings Trend (Last 7 Days) */}
        <Card className="border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Findings Trend (Last 7 Days)</h3>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">Last 7 days</span>
          </div>
          {/* Sparkline Graphic */}
          <div className="relative mt-3 h-32 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 300 90">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Area Fill */}
              <polygon points="0,70 50,60 100,75 150,45 200,55 250,30 300,40 300,90 0,90" fill="url(#trendGradient)" />

              {/* Smooth Trend Line */}
              <path
                d="M 0,70 Q 25,65 50,60 T 100,75 T 150,45 T 200,55 T 250,30 T 300,40"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />

              {/* Data Nodes */}
              {[
                { x: 0, y: 70 },
                { x: 50, y: 60 },
                { x: 100, y: 75 },
                { x: 150, y: 45 },
                { x: 200, y: 55 },
                { x: 250, y: 30 },
                { x: 300, y: 40 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" className="fill-slate-900 stroke-cyan-400 stroke-2 transition hover:r-5" />
              ))}
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Sep 6</span>
              <span>Sep 7</span>
              <span>Sep 8</span>
              <span>Sep 9</span>
              <span>Sep 10</span>
              <span>Sep 11</span>
              <span>Sep 12</span>
            </div>
          </div>
        </Card>

        {/* 3. Donut Ring Distribution Chart */}
        <Card className="flex items-center justify-between border-slate-800 bg-slate-900/90 p-4">
          <div className="flex flex-col justify-between h-full w-full">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Severity Distribution</h3>
            <div className="flex items-center justify-around py-1">
              {/* SVG Donut */}
              <div className="relative flex items-center justify-center">
                <svg className="h-28 w-28 -rotate-90 stroke-slate-800 stroke-[12]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                  {/* Critical Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray="238"
                    strokeDashoffset={238 - (238 * (criticalCount / (totalCount || 1)))}
                  />
                  {/* High Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeDasharray="238"
                    strokeDashoffset={238 - (238 * ((criticalCount + highCount) / (totalCount || 1)))}
                  />
                  {/* Medium Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray="238"
                    strokeDashoffset={238 - (238 * ((criticalCount + highCount + mediumCount) / (totalCount || 1)))}
                  />
                  {/* Low Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray="238"
                    strokeDashoffset={0}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-bold text-white">{totalCount}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-300">Critical</span>
                  <span className="font-mono text-slate-400 font-semibold">{criticalCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  <span className="text-slate-300">High</span>
                  <span className="font-mono text-slate-400 font-semibold">{highCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-300">Medium</span>
                  <span className="font-mono text-slate-400 font-semibold">{mediumCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Low</span>
                  <span className="font-mono text-slate-400 font-semibold">{lowCount}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filters Bar */}
      <Card className="relative z-30 border-slate-800 bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search findings, endpoints, or CVE..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-slate-700/80 bg-slate-950/80 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Custom Select Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              value={filters.severity}
              onChange={(v) => setFilters({ ...filters, severity: v })}
              options={[
                { label: 'All severities', value: '' },
                { label: 'Critical', value: 'Critical' },
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
                { label: 'Informational', value: 'Informational' },
              ]}
            />

            <FilterSelect
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              options={[
                { label: 'All statuses', value: '' },
                { label: 'Potential', value: 'Potential' },
                { label: 'Under Review', value: 'Under Review' },
                { label: 'Verified', value: 'Verified' },
                { label: 'False Positive', value: 'False Positive' },
                { label: 'Resolved', value: 'Resolved' },
              ]}
            />

            <FilterSelect
              value={filters.project}
              onChange={(v) => setFilters({ ...filters, project: v })}
              options={[
                { label: 'All projects', value: '' },
                { label: 'SahakarGig', value: 'SahakarGig' },
                { label: 'Sentinel AI', value: 'Sentinel AI' },
                { label: 'Main Target', value: 'Main Target' },
              ]}
            />

            <FilterSelect
              value={filters.asset}
              onChange={(v) => setFilters({ ...filters, asset: v })}
              options={[
                { label: 'All assets', value: '' },
                { label: '/api/assets', value: '/api/assets' },
                { label: '/login', value: '/login' },
                { label: '/auth', value: '/auth' },
                { label: '/api/profile', value: '/api/profile' },
              ]}
            />

            <FilterSelect
              value={filters.dateRange}
              onChange={(v) => setFilters({ ...filters, dateRange: v })}
              options={[
                { label: 'Date range', value: 'all' },
                { label: 'Last 7 days', value: '7d' },
                { label: 'Last 30 days', value: '30d' },
              ]}
            />

            <FilterSelect
              value={filters.sort}
              onChange={(v) => setFilters({ ...filters, sort: v })}
              options={[
                { label: 'Sort: Newest', value: 'newest' },
                { label: 'Sort: Oldest', value: 'oldest' },
                { label: 'Highest CVSS', value: 'cvss_desc' },
              ]}
            />

            <button
              onClick={handleClearFilters}
              title="Reset all search and filter dropdowns"
              className="rounded-md border border-slate-700/60 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Main Data Table */}
      <Card className="relative z-10 overflow-hidden border-slate-800 bg-slate-900/90 shadow-xl">
        {isLoading && <LoadingState label="Loading vulnerability database..." />}
        {isError && <ErrorState message="Could not fetch findings records." onRetry={() => refetch()} />}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-10 px-4 py-3 text-center">
                    <input type="checkbox" title="Select all findings" className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0" />
                  </th>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-4 py-3">TITLE</th>
                  <th className="px-3 py-3">SEVERITY</th>
                  <th className="px-3 py-3">CVSS</th>
                  <th className="px-4 py-3">ASSET / ENDPOINT</th>
                  <th className="px-3 py-3">STATUS</th>
                  <th className="px-4 py-3">DETECTED</th>
                  <th className="px-4 py-3">UPDATED</th>
                  <th className="w-12 px-3 py-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {findingsList.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelectedFinding(item)}
                    title={`Click to inspect details for ${item.findingId}: ${item.title}`}
                    className={cn(
                      'group cursor-pointer transition duration-150 hover:bg-slate-800/60',
                      selectedFinding?._id === item._id && 'bg-slate-800/80 border-l-2 border-cyan-400'
                    )}
                  >
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" title={`Select ${item.findingId}`} className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0" />
                    </td>
                    <td className="px-3 py-3.5 font-mono font-medium text-slate-400 group-hover:text-cyan-400">{item.findingId}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-300">{item.title}</div>
                      <div className="truncate max-w-xs text-[11px] text-slate-400">{item.description}</div>
                    </td>
                    <td className="px-3 py-3.5">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="px-3 py-3.5 font-mono font-semibold text-slate-200">{item.cvssScore}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-cyan-400" title={`Endpoint asset path: ${item.affectedAssets?.[0]}`}>{item.affectedAssets?.[0] || 'N/A'}</span>
                        {item.httpMethod && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-300" title={`HTTP Method: ${item.httpMethod}`}>
                            {item.httpMethod}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(item.detectedDate || item.createdAt).date}
                      <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                        {formatDateTime(item.detectedDate || item.createdAt).time}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(item.updatedDate || item.updatedAt).date}
                      <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                        {formatDateTime(item.updatedDate || item.updatedAt).time}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center text-slate-500 hover:text-slate-200" onClick={(e) => e.stopPropagation()}>
                      <button className="rounded p-1 hover:bg-slate-800" title="More options">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Toast Alert Banner and Pagination */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950/70 px-4 py-3">
          {/* Toast alert banner inside bottom left */}
          {toastMessage.show ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/80 px-3 py-1.5 text-xs text-emerald-300 shadow-lg animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <b>Finding verified successfully:</b> {toastMessage.id} has been marked as verified.
              </span>
              <button
                onClick={() => setToastMessage({ ...toastMessage, show: false })}
                className="ml-2 text-emerald-400 hover:text-emerald-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div />
          )}

          {/* Pagination */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Showing 1-6 of {totalCount} findings</span>
            <div className="ml-4 flex items-center gap-1">
              <button className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-400 hover:bg-slate-800 disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-7 w-7 rounded border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 font-semibold">1</button>
              <button className="h-7 w-7 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800">2</button>
              <button className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-400 hover:bg-slate-800">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Slide-Over Right Drawer / Sidebar when ANY item is clicked */}
      <AnimatePresence>
        {selectedFinding && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFinding(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-slate-950 p-0 shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-slate-800 bg-slate-900/90 p-5">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300 font-bold">{selectedFinding.findingId}</span>
                    <StatusBadge status={selectedFinding.status} />
                  </div>
                  <button
                    onClick={() => setSelectedFinding(null)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">{selectedFinding.title}</h2>
                <p className="mt-1 text-xs text-slate-400">{selectedFinding.description}</p>

                {/* Drawer Nav Tabs */}
                <div className="mt-5 flex border-b border-slate-800 gap-6 text-xs font-medium">
                  {['details', 'evidence', 'remediation', 'timeline'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDrawerTab(tab)}
                      className={cn(
                        'pb-2.5 capitalize transition border-b-2',
                        drawerTab === tab
                          ? 'border-cyan-400 font-semibold text-cyan-300'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Body Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {drawerTab === 'details' && (
                  <div className="space-y-4">
                    {/* Risk Information Card */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                        <AlertTriangle className="h-4 w-4" /> Risk Information
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Severity</span>
                          <SeverityBadge severity={selectedFinding.severity} />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">CVSS Score</span>
                          <span className="font-mono font-bold text-white text-sm">{selectedFinding.cvssScore}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">CWE</span>
                          <span className="font-mono text-cyan-300">{selectedFinding.cweId || 'CWE-862'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">OWASP Top 10</span>
                          <span className="font-mono text-cyan-300">{selectedFinding.owaspCategory || 'A01:2021'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Affected Asset Card */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
                        <Layers className="h-4 w-4" /> Affected Asset
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">Endpoint</span>
                          <span className="text-slate-200">{selectedFinding.affectedAssets?.[0] || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">Method</span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">{selectedFinding.httpMethod || 'GET'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">Project</span>
                          <span className="text-slate-200">{selectedFinding.project || 'SahakarGig'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">Technology</span>
                          <span className="text-slate-200">{selectedFinding.technology || 'Node.js (Express)'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps Card */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        <Clock className="h-4 w-4" /> Timestamps
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">Detected</span>
                          <span className="text-slate-300">
                            {formatDateTime(selectedFinding.detectedDate || selectedFinding.createdAt).full}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">Last Updated</span>
                          <span className="text-slate-300">
                            {formatDateTime(selectedFinding.updatedDate || selectedFinding.updatedAt).full}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">First Seen</span>
                          <span className="text-slate-300">
                            {formatDateTime(selectedFinding.firstSeen || selectedFinding.createdAt).full}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[11px]">Last Seen</span>
                          <span className="text-slate-300">
                            {formatDateTime(selectedFinding.lastSeen || selectedFinding.updatedAt).full}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'evidence' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                      <h4 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        <span>HTTP Request Trace</span>
                        <span className="font-mono text-[10px] text-cyan-400">Captured Log</span>
                      </h4>
                      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400 border border-slate-800">
                        {selectedFinding.evidence || 'No payload log captured.'}
                      </pre>
                    </div>
                  </div>
                )}

                {drawerTab === 'remediation' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">Recommended Steps</h4>
                      <ul className="list-disc space-y-2 pl-4 text-xs text-slate-300">
                        {(selectedFinding.remediation || ['Check input validation middleware.']).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {drawerTab === 'timeline' && (
                  <div className="space-y-3">
                    <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:h-full before:w-0.5 before:bg-slate-800 space-y-4">
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                        <p className="text-xs font-semibold text-slate-200">Finding Verified</p>
                        <p className="text-[10px] text-slate-500 font-mono">Sep 12, 2026 - 15:08 by Security Lead</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-slate-950" />
                        <p className="text-xs font-semibold text-slate-200">Moved to Under Review</p>
                        <p className="text-[10px] text-slate-500 font-mono">Sep 12, 2026 - 14:40</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-cyan-500 ring-4 ring-slate-950" />
                        <p className="text-xs font-semibold text-slate-200">Initial Discovery by Live Scanner</p>
                        <p className="text-[10px] text-slate-500 font-mono">Sep 12, 2026 - 14:32</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-slate-800 bg-slate-900/90 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/findings/${selectedFinding._id}`)}
                    className="flex items-center gap-1.5 text-xs text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/10"
                  >
                    Open Full Page View <ExternalLink className="h-3.5 w-3.5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        verifyMutation.mutate({ id: selectedFinding._id, status: 'Under Review' })
                      }
                      className="text-xs"
                    >
                      Mark Under Review
                    </Button>

                    <Button
                      onClick={() =>
                        verifyMutation.mutate({ id: selectedFinding._id, status: 'Verified' })
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                    >
                      Resolve Finding
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Executive Metric Card Helper Component
function MetricCard({ title, value, trend, icon: Icon, color = 'cyan', badgeColor = 'bg-cyan-500' }) {
  return (
    <Card className="relative overflow-hidden border-slate-800 bg-slate-900/90 p-3.5 shadow-md backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 truncate">{title}</span>
        <span className={cn('h-2 w-2 rounded-full', badgeColor)} />
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold tracking-tight text-white font-mono">{value}</span>
        {trend && <span className="text-[10px] font-medium text-slate-400 font-mono">{trend}</span>}
      </div>
    </Card>
  );
}

// Progress Bar Helper Component
function SeverityProgressBar({ label, count, total, color, text }) {
  const pct = Math.round((count / (total || 1)) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <span className={cn('font-mono font-semibold', text)}>{count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Dropdown Helper Component
function FilterSelect({ value, onChange, options, className = 'w-36' }) {
  return (
    <CustomSelect
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      className={className}
    />
  );
}

// Full Page View Component for `/findings/:id`
export function FindingDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['finding', id],
    queryFn: async () => (await api.get(`/findings/${id}`)).data,
  });

  const verify = useMutation({
    mutationFn: async (status) => (await api.post(`/findings/${id}/verify`, { status, confidence: 95 })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finding', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
    },
  });

  const ai = useMutation({
    mutationFn: async () => (await api.post(`/findings/${id}/ai-analysis`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finding', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
    },
  });

  if (isLoading) return <LoadingState label="Loading detailed vulnerability breakdown..." />;
  if (isError) return <ErrorState message="Finding record not found." onRetry={() => refetch()} />;

  const v = data?.finding || {
    _id: id,
    findingId: 'VUL-003',
    title: 'Broken Access Control',
    category: 'Authorization',
    description: 'Improper access control allows unauthorized users to read or mutate protected resources.',
    cvssScore: 8.1,
    severity: 'High',
    status: 'Verified',
    affectedAssets: ['/api/assets'],
    evidence: 'GET /api/assets HTTP/1.1\nHost: target.com\nAuthorization: Bearer unprivileged_user_token\n\nHTTP/1.1 200 OK',
    remediation: ['Enforce middleware authentication on resource queries.', 'Verify user ID matches session token.'],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Detail Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/findings');
            }
          }}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-300 transition duration-200 hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-cyan-400 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </div>

      <PageHeader
        title={`${v.findingId} · ${v.title}`}
        subtitle={`${v.category || 'Security Finding'} · CVSS ${v.cvssScore}`}
        actions={
          <div className="flex items-center gap-2">
            <SeverityBadge severity={v.severity} />
            <StatusBadge status={v.status} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Overview</h3>
            <p className="text-sm text-slate-200">{v.description || 'No description available.'}</p>

            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Affected Endpoint</h4>
              <p className="font-mono text-xs text-cyan-300">{(v.affectedAssets || []).join(', ') || 'N/A'}</p>
            </div>
          </Card>

          {/* Evidence */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Captured Evidence</h3>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800">
              {v.evidence || 'No raw HTTP trace recorded.'}
            </pre>
          </Card>

          {/* Remediation */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Remediation Guide</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
              {(v.remediation || []).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Side Column */}
        <div className="space-y-6">
          {/* CVSS Metric Card */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 text-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">CVSS v3 Score</h3>
            <div className="mt-2 text-4xl font-extrabold text-white font-mono">{v.cvssScore}</div>
            <div className="mt-3 flex justify-center">
              <SeverityBadge severity={v.severity} />
            </div>
          </Card>

          {/* AI Security Analysis */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Sparkles className="h-4 w-4 text-cyan-400" /> Gemini AI Analysis
              </h3>
              <Button
                variant="outline"
                disabled={ai.isPending}
                onClick={() => ai.mutate()}
                className="text-xs flex items-center gap-1"
              >
                <RefreshCw className={cn('h-3 w-3', ai.isPending && 'animate-spin')} />
                {ai.isPending ? 'Analyzing…' : 'Refresh AI'}
              </Button>
            </div>

            {v.aiAnalysis?.classification ? (
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <b className="text-white">Classification:</b> {v.aiAnalysis.classification} ({v.aiAnalysis.confidence}%)
                </p>
                <p>
                  <b className="text-white">Impact:</b> {v.aiAnalysis.impact}
                </p>
                <p>
                  <b className="text-white">Fix:</b> {(v.aiAnalysis.remediation || []).join(' | ')}
                </p>
                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                  {v.aiAnalysis.priorityReason} · Presented as AI assistance.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No AI analysis generated yet — click Refresh AI above.</p>
            )}
            {ai.isError && <p className="text-xs text-red-400">{errMsg(ai.error)}</p>}
          </Card>

          {/* Verification Workflow */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Under Review', 'Verified', 'False Positive', 'Resolved'].map((st) => (
                <Button
                  key={st}
                  variant="outline"
                  disabled={verify.isPending}
                  onClick={() => verify.mutate(st)}
                  className="text-xs py-1.5"
                >
                  Mark {st}
                </Button>
              ))}
            </div>
            {verify.isError && <p className="text-xs text-red-400">{errMsg(verify.error)}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

