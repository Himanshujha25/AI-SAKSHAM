import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  XCircle,
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
  Bug,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronLeft,
  ArrowLeft,
  MoreVertical,
  Copy,
  Check,
  Timer,
  RotateCcw,
  Folder,
  ShieldAlert,
  Download,
  BookOpen,
  HelpCircle,
  Scale,
  Zap,
} from 'lucide-react';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { errMsg, cn, buildCurl, slaCountdown } from '../../lib/utils';
import CustomSelect from '../../components/ui/CustomSelect';
import { PageHeader, LoadingState, ErrorState, EmptyState, SeverityBadge, StatusBadge, PremiumIcon } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';
import { CombinedConclusionCard } from '../../components/pentera/CombinedConclusionCard';
import { PenteraRemediationWiki } from '../../components/pentera/PenteraRemediationWiki';

function formatDateTime(val) {  if (!val) val = new Date().toISOString();
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

// One-click PoC cURL exporter — copies a reproducible curl for the finding.
function CopyCurlButton({ finding, className }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(buildCurl(finding));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (e) {
          setCopied(false);
        }
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 backdrop-blur-xl dark:bg-white/[0.04] backdrop-blur-xl px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition hover:bg-white/85 dark:hover:bg-white/[0.08] hover:text-[#0f1f3d] dark:hover:text-white hover:border-slate-300 dark:hover:border-white/15',
        className
      )}
      title="Copy reproducible PoC cURL command"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />}
      {copied ? 'Copied!' : 'Copy cURL PoC'}
    </button>
  );
}

function SlaBadge({ dueAt }) {
  const { text, overdue } = slaCountdown(dueAt);
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold',
      overdue ? 'bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-400/40' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/40'
    )}>
      <Timer className="h-3 w-3" /> SLA: {text}
    </span>
  );
}

function getCodeFixSnippet(finding) {
  if (!finding) return '';
  const title = (finding.title || '').toLowerCase();
  const cat = (finding.category || '').toLowerCase();
  const rawEp = finding.affectedAssets?.[0] || '/api/wallet';
  const endpoint = rawEp.includes('://') ? new URL(rawEp).pathname : rawEp;

  if (title.includes('rate-limit') || title.includes('rate limiting') || cat.includes('rate')) {
    return `// Express.js Rate-Limiting Middleware Fix
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 100, // Max 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, try again later.' }
});

app.use('${endpoint || '/api/wallet'}', apiLimiter);`;
  }

  if (title.includes('content-security-policy') || title.includes('csp') || title.includes('hsts') || cat.includes('header')) {
    return `// Helmet Security Headers Fix for Node.js Express
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));`;
  }

  if (title.includes('idor') || title.includes('access control') || cat.includes('access')) {
    return `// Ownership Authorization Middleware
async function verifyOwnership(req, res, next) {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });

  // Enforce Tenant & Resource Owner Check
  if (String(resource.owner) !== String(req.user._id) && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: access denied' });
  }
  req.resource = resource;
  next();
}`;
  }

  return `// Express Hardening Middleware
app.use('${endpoint || '/api/wallet'}', (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
});`;
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

  // Dynamic Pagination & Bulk Selection States
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedIds, setSelectedIds] = useState([]);

  // Selected finding for the right slide-over drawer
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details'); // 'details' | 'suggestions' | 'evidence' | 'remediation' | 'timeline'
  const [copiedCode, setCopiedCode] = useState(false);

  // Prevent background page scrolling when the right drawer is open
  useEffect(() => {
    if (selectedFinding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedFinding]);

  const drawerAiMutation = useMutation({
    mutationFn: async (id) => (await api.post(`/findings/${id}/ai-analysis`, {}, { timeout: 60000 })).data,
    onSuccess: (resData) => {
      qc.invalidateQueries({ queryKey: ['findings'] });
      if (resData?.finding) {
        setSelectedFinding(resData.finding);
      }
    },
  });

  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        severity: filters.severity,
        status: filters.status,
        projectId: filters.project,
        search: filters.search,
      }).filter(([, val]) => val !== '' && val !== 'all')
    )
  ).toString();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['findings', queryString],
    queryFn: async () => (await api.get(`/findings?${queryString}`)).data,
    refetchInterval: 3000,
  });

  useEffect(() => {
    const s = getSocket();
    const onProgress = () => {
      qc.invalidateQueries({ queryKey: ['findings'] });
    };
    s.on('assessment:progress', onProgress);
    return () => { s.off('assessment:progress', onProgress); };
  }, [qc]);

  const projectsQuery = useQuery({
    queryKey: ['projects-mini'],
    queryFn: async () => (await api.get('/projects')).data,
  });
  const projectOptions = [
    { label: 'All projects', value: '' },
    ...(projectsQuery.data?.projects || []).map((p) => ({ label: p.name, value: p._id })),
  ];

  const hasFetched = Array.isArray(data?.findings);
  const rawList = useMemo(() => {
    return hasFetched
      ? (data.findings.length > 0
          ? data.findings.map((f) => ({
              ...f,
              detectedDate: f.detectedDate || f.createdAt || new Date().toISOString(),
              updatedDate: f.updatedDate || f.updatedAt || f.createdAt || new Date().toISOString(),
              firstSeen: f.firstSeen || f.createdAt || new Date().toISOString(),
              lastSeen: f.lastSeen || f.updatedAt || f.createdAt || new Date().toISOString(),
            }))
          : [])
      : [];
  }, [hasFetched, data?.findings]);

  const assetOptions = useMemo(() => {
    const set = new Set();
    rawList.forEach((f) => {
      (f.affectedAssets || []).forEach((a) => {
        if (a) set.add(a);
      });
    });
    return [
      { label: 'All assets', value: '' },
      ...Array.from(set).map((a) => ({ label: a, value: a })),
    ];
  }, [rawList]);

  const findingsList = useMemo(() => {
    let list = [...rawList];

    // Client-side asset filter
    if (filters.asset) {
      list = list.filter((f) =>
        (f.affectedAssets || []).some((a) => String(a).toLowerCase().includes(filters.asset.toLowerCase()))
      );
    }

    // Client-side dateRange filter
    if (filters.dateRange === '7d') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((f) => new Date(f.detectedDate).getTime() >= cutoff);
    } else if (filters.dateRange === '30d') {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((f) => new Date(f.detectedDate).getTime() >= cutoff);
    }

    // Client-side sorting
    if (filters.sort === 'oldest') {
      list.sort((a, b) => new Date(a.detectedDate).getTime() - new Date(b.detectedDate).getTime());
    } else if (filters.sort === 'cvss_desc') {
      list.sort((a, b) => (b.cvssScore || 0) - (a.cvssScore || 0));
    } else if (filters.sort === 'newest') {
      list.sort((a, b) => new Date(b.detectedDate).getTime() - new Date(a.detectedDate).getTime());
    }

    return list;
  }, [rawList, filters.asset, filters.dateRange, filters.sort]);

  // Dynamic Pagination Calculations
  const totalCount = findingsList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return findingsList.slice(start, start + pageSize);
  }, [findingsList, page, pageSize]);

  // Bulk Selection Helpers
  const isAllSelected = paginatedList.length > 0 && paginatedList.every((f) => selectedIds.includes(f._id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedList.map((f) => f._id));
    }
  };
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Calculate stats dynamically
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

  const handleBulkVerify = async (status) => {
    for (const id of selectedIds) {
      try {
        await api.post(`/findings/${id}/verify`, { status, confidence: 95 });
      } catch (e) {}
    }
    setSelectedIds([]);
    qc.invalidateQueries({ queryKey: ['findings'] });
  };

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
  const projectMap = useMemo(() => {
    const map = {};
    (projectsQuery.data?.projects || []).forEach((p) => {
      map[String(p._id)] = p.name;
    });
    return map;
  }, [projectsQuery.data]);

  // Dynamic 24-hour trends based on real finding timestamps
  const oneDayAgo = useMemo(() => Date.now() - 24 * 60 * 60 * 1000, []);
  const todayTotal = useMemo(
    () => findingsList.filter((f) => new Date(f.detectedDate).getTime() >= oneDayAgo).length,
    [findingsList, oneDayAgo]
  );
  const todayCritical = useMemo(
    () => findingsList.filter((f) => f.severity === 'Critical' && new Date(f.detectedDate).getTime() >= oneDayAgo).length,
    [findingsList, oneDayAgo]
  );
  const todayHigh = useMemo(
    () => findingsList.filter((f) => f.severity === 'High' && new Date(f.detectedDate).getTime() >= oneDayAgo).length,
    [findingsList, oneDayAgo]
  );
  const todayMedium = useMemo(
    () => findingsList.filter((f) => f.severity === 'Medium' && new Date(f.detectedDate).getTime() >= oneDayAgo).length,
    [findingsList, oneDayAgo]
  );
  const todayLow = useMemo(
    () => findingsList.filter((f) => f.severity === 'Low' && new Date(f.detectedDate).getTime() >= oneDayAgo).length,
    [findingsList, oneDayAgo]
  );

  return (
    <div className="relative min-h-screen pb-16 space-y-6">
      {/* Page Header with Interactive Date Range Selector */}
      <PageHeader
        icon={Bug}
        tone="amber"
        title="Findings"
        subtitle="Vulnerabilities with evidence, verification, CVSS and analysis"
        actions={
          <div className="w-56">
            <CustomSelect
              value={filters.dateRange}
              onChange={(e) => {
                setFilters({ ...filters, dateRange: e.target.value });
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All time' },
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
              ]}
            />
          </div>
        }
      />

      {/* Top Row: Executive Metric Summary Cards (6 Columns — Clickable Quick Filters) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="Total findings"
          value={totalCount}
          trend={todayTotal > 0 ? `+${todayTotal} today` : 'No change'}
          icon={Shield}
          color="cyan"
          active={!filters.severity && !filters.status}
          onClick={() => {
            setFilters({ ...filters, severity: '', status: '' });
            setPage(1);
          }}
          tooltip="Click to view all vulnerability findings."
        />
        <MetricCard
          title="Critical"
          value={criticalCount}
          trend={todayCritical > 0 ? `+${todayCritical} today` : '0 today'}
          icon={AlertOctagon}
          color="red"
          badgeColor="bg-red-500"
          active={filters.severity === 'Critical'}
          onClick={() => {
            setFilters({ ...filters, severity: filters.severity === 'Critical' ? '' : 'Critical' });
            setPage(1);
          }}
          tooltip="Click to filter Critical vulnerabilities."
        />
        <MetricCard
          title="High"
          value={highCount}
          trend={todayHigh > 0 ? `+${todayHigh} today` : '0 today'}
          icon={AlertTriangle}
          color="orange"
          badgeColor="bg-orange-500"
          active={filters.severity === 'High'}
          onClick={() => {
            setFilters({ ...filters, severity: filters.severity === 'High' ? '' : 'High' });
            setPage(1);
          }}
          tooltip="Click to filter High severity vulnerabilities."
        />
        <MetricCard
          title="Medium"
          value={mediumCount}
          trend={todayMedium > 0 ? `+${todayMedium} today` : '0 today'}
          icon={Activity}
          color="amber"
          badgeColor="bg-amber-500"
          active={filters.severity === 'Medium'}
          onClick={() => {
            setFilters({ ...filters, severity: filters.severity === 'Medium' ? '' : 'Medium' });
            setPage(1);
          }}
          tooltip="Click to filter Medium severity vulnerabilities."
        />
        <MetricCard
          title="Low"
          value={lowCount}
          trend={todayLow > 0 ? `+${todayLow} today` : '0 today'}
          icon={Info}
          color="green"
          badgeColor="bg-emerald-500"
          active={filters.severity === 'Low'}
          onClick={() => {
            setFilters({ ...filters, severity: filters.severity === 'Low' ? '' : 'Low' });
            setPage(1);
          }}
          tooltip="Click to filter Low severity vulnerabilities."
        />
        <MetricCard
          title="Verified"
          value={verifiedCount}
          trend={`${Math.round((verifiedCount / (totalCount || 1)) * 100)}% resolved`}
          icon={CheckCircle2}
          color="emerald"
          badgeColor="bg-blue-500 dark:bg-cyan-500"
          active={filters.status === 'Verified'}
          onClick={() => {
            setFilters({ ...filters, status: filters.status === 'Verified' ? '' : 'Verified' });
            setPage(1);
          }}
          tooltip="Click to filter Verified findings."
        />
      </div>

      {/* Middle Row: Analytics Modules (3 Columns) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 1. Findings by Severity Bar Breakdown */}
        <Card className="flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Findings by Severity</h3>
              <span className="text-[11px] text-slate-500 font-mono">Live Breakdown</span>
            </div>
            <div className="space-y-3 pt-1">
              <SeverityProgressBar
                label="Critical"
                count={criticalCount}
                total={totalCount}
                color="bg-red-500"
                text="text-red-600 dark:text-red-400"
                onClick={() => {
                  setFilters({ ...filters, severity: 'Critical' });
                  setPage(1);
                }}
              />
              <SeverityProgressBar
                label="High"
                count={highCount}
                total={totalCount}
                color="bg-orange-500"
                text="text-orange-600 dark:text-orange-400"
                onClick={() => {
                  setFilters({ ...filters, severity: 'High' });
                  setPage(1);
                }}
              />
              <SeverityProgressBar
                label="Medium"
                count={mediumCount}
                total={totalCount}
                color="bg-amber-500"
                text="text-amber-600 dark:text-amber-400"
                onClick={() => {
                  setFilters({ ...filters, severity: 'Medium' });
                  setPage(1);
                }}
              />
              <SeverityProgressBar
                label="Low"
                count={lowCount}
                total={totalCount}
                color="bg-emerald-500"
                text="text-emerald-600 dark:text-emerald-400"
                onClick={() => {
                  setFilters({ ...filters, severity: 'Low' });
                  setPage(1);
                }}
              />
            </div>
          </div>
        </Card>

        {/* 2. Findings Trend (Last 7 Days) */}
        <FindingsTrendChart findings={findingsList} />

        {/* 3. Donut Ring Distribution Chart */}
        <SeverityDistributionChart
          critical={criticalCount}
          high={highCount}
          medium={mediumCount}
          low={lowCount}
          total={totalCount}
          onSelectSeverity={(sev) => {
            setFilters({ ...filters, severity: sev });
            setPage(1);
          }}
        />
      </div>

      {/* Toolbar & Filters Bar */}
      <Card className="relative z-30 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search findings, endpoints, or CVE..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 py-1.5 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Custom Select Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              value={filters.severity}
              onChange={(v) => {
                setFilters({ ...filters, severity: v });
                setPage(1);
              }}
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
              onChange={(v) => {
                setFilters({ ...filters, status: v });
                setPage(1);
              }}
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
              onChange={(v) => {
                setFilters({ ...filters, project: v });
                setPage(1);
              }}
              options={projectOptions}
            />

            <FilterSelect
              value={filters.asset}
              onChange={(v) => {
                setFilters({ ...filters, asset: v });
                setPage(1);
              }}
              options={assetOptions}
            />

            <FilterSelect
              value={filters.dateRange}
              onChange={(v) => {
                setFilters({ ...filters, dateRange: v });
                setPage(1);
              }}
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
              onClick={() => {
                handleClearFilters();
                setPage(1);
              }}
              title="Reset all search and filter dropdowns"
              className="rounded-md border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#0f1f3d] dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Bulk Selection Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 dark:border-cyan-500/40 bg-white dark:bg-slate-950 p-3 px-4 shadow-xl font-mono text-xs animate-in fade-in">
          <span className="text-blue-600 dark:text-cyan-300 font-bold">
            {selectedIds.length} finding{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkVerify('Verified')}
              className="rounded bg-emerald-500/20 px-3 py-1 font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition"
            >
              Mark Selected Verified
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-1 font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0f1f3d] dark:hover:text-white transition"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <Card className="relative z-10 overflow-hidden border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shadow-xl">
        {isLoading && <LoadingState label="Loading vulnerability database..." />}
        {isError && <ErrorState message="Could not fetch findings records." onRetry={() => refetch()} />}

        {!isLoading && !isError && (
          <div className="w-full">
            {/* Mobile View: Compact Vulnerability Cards (< 768px) */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800/70 md:hidden">
              {paginatedList.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedFinding(item)}
                  className="p-3.5 space-y-2.5 transition active:bg-slate-50 dark:active:bg-slate-800/40 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSelectOne(item._id)}
                        title={`Select ${item.findingId}`}
                        className="h-4 w-4 rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{item.findingId}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <SeverityBadge severity={item.severity} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/50 font-mono text-[11px]">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[210px]">
                      <span className="text-slate-500">Target:</span>
                      <span className="text-blue-600 dark:text-cyan-300 truncate">{item.affectedAssets?.[0] || '/api'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-bold text-[#0f1f3d] dark:text-white">
                        CVSS {item.cvssScore}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFinding(item);
                        }}
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-blue-200 dark:border-cyan-500/40 bg-blue-50 dark:bg-cyan-950/40 px-2.5 py-1 font-bold text-blue-600 dark:text-cyan-300"
                      >
                        Inspect <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: High-Density Data Table (>= 768px) — Locked 100% Width (No Horizontal Scroll) */}
            <div className="hidden md:block w-full overflow-hidden">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="w-9 px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        title="Select all findings on this page"
                        className="rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="w-20 px-2 py-3">ID</th>
                    <th className="px-3 py-3">TITLE</th>
                    <th className="w-28 px-2 py-3">PROJECT</th>
                    <th className="w-24 px-2 py-3">SEVERITY</th>
                    <th className="w-14 px-2 py-3">CVSS</th>
                    <th className="w-48 px-2 py-3">ASSET / ENDPOINT</th>
                    <th className="w-28 px-2 py-3">STATUS</th>
                    <th className="w-28 px-2 py-3">DETECTED</th>
                    <th className="w-20 px-2 py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {paginatedList.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedFinding(item)}
                      title={`Click to inspect details for ${item.findingId}: ${item.title}`}
                      className={cn(
                        'group cursor-pointer transition duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60',
                        selectedFinding?._id === item._id && 'bg-slate-100 dark:bg-slate-800/80 border-l-2 border-cyan-400'
                      )}
                    >
                      <td className="w-9 px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => toggleSelectOne(item._id)}
                          title={`Select ${item.findingId}`}
                          className="rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="w-20 px-2 py-3 font-mono font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 truncate">
                        {item.findingId}
                      </td>
                      <td className="px-3 py-3 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-300 truncate" title={item.title}>
                          {item.title}
                        </div>
                        <div className="truncate text-[11px] text-slate-500 dark:text-slate-400" title={item.description}>
                          {item.description}
                        </div>
                      </td>
                      <td className="w-28 px-2 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-sm max-w-full truncate" title={item.projectId?.name || projectMap[String(item.projectId)] || 'Project'}>
                          <Folder className="h-3 w-3 text-blue-600 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">
                            {item.projectId?.name || projectMap[String(item.projectId)] || 'Project'}
                          </span>
                        </span>
                      </td>
                      <td className="w-24 px-2 py-3">
                        <SeverityBadge severity={item.severity} />
                      </td>
                      <td className="w-14 px-2 py-3 font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {item.cvssScore}
                      </td>
                      <td className="w-48 px-2 py-3">
                        <div className="flex items-center gap-1 font-mono text-[11px] max-w-full">
                          <span className="truncate text-blue-600 dark:text-cyan-400" title={`Endpoint asset path: ${item.affectedAssets?.[0]}`}>
                            {item.affectedAssets?.[0] || 'N/A'}
                          </span>
                          {item.httpMethod && (
                            <span className="shrink-0 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 dark:text-slate-300" title={`HTTP Method: ${item.httpMethod}`}>
                              {item.httpMethod}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="w-28 px-2 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="w-28 px-2 py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <span className="font-medium text-slate-700 dark:text-slate-300 block truncate">
                          {formatDateTime(item.detectedDate || item.createdAt).date}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {formatDateTime(item.detectedDate || item.createdAt).time}
                        </span>
                      </td>
                      <td className="w-20 px-2 py-3 text-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedFinding(item)}
                          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-cyan-500/40 transition"
                          title={`Inspect finding ${item.findingId}`}
                        >
                          Inspect <ChevronRight size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table Footer with Dynamic Pagination */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 font-mono text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing {totalCount > 0 ? (page - 1) * pageSize + 1 : 0}-
            {Math.min(page * pageSize, totalCount)} of {totalCount} findings
          </span>

          {/* Dynamic Pagination Controls */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={cn(
                  'h-7 w-7 rounded-lg border font-mono text-[11px] font-bold transition backdrop-blur-xl',
                  page === pageNum
                    ? 'bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] border-slate-200 dark:border-white/[0.14] text-[#0f1f3d] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-white/85 dark:hover:bg-white/[0.06] hover:text-[#0f1f3d] dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10'
                )}
              >
                {pageNum}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0 shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4 sm:p-5">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-blue-600 dark:text-cyan-300 font-bold">{selectedFinding.findingId}</span>
                    <StatusBadge status={selectedFinding.status} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFinding(null)}
                    className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white"
                    aria-label="Close Finding Details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0f1f3d] dark:text-white">{selectedFinding.title}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{selectedFinding.description}</p>

                {/* Drawer Nav Tabs (Scrollable on mobile without wrapping) */}
                <div className="mt-4 flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-medium" style={{ scrollbarWidth: 'none' }}>
                  {['details', 'suggestions', 'evidence', 'remediation', 'timeline'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDrawerTab(tab)}
                      className={cn(
                        'pb-3 pt-1 capitalize transition border-b-2 flex items-center gap-1.5 shrink-0 min-h-[44px]',
                        drawerTab === tab
                          ? 'border-cyan-400 font-semibold text-blue-600 dark:text-cyan-300'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      )}
                    >
                      {tab === 'suggestions' && <Code2 className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />}
                      <span>{tab === 'suggestions' ? 'Remediation Code' : tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Body Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {drawerTab === 'suggestions' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-200 dark:border-cyan-500/30 bg-gradient-to-b from-blue-50 dark:from-cyan-950/40 to-white dark:to-slate-900/90 p-4 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-300">
                          <Code2 className="h-4 w-4 text-blue-600 dark:text-cyan-400" /> Security Remediation & Analysis
                        </h4>
                        <button
                          disabled={drawerAiMutation.isPending}
                          onClick={() => drawerAiMutation.mutate(selectedFinding._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border border-slate-200 dark:border-white/[0.14] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white transition hover:bg-white/85 dark:hover:bg-white/[0.12] hover:border-slate-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={cn('h-3 w-3', drawerAiMutation.isPending && 'animate-spin')} />
                          {drawerAiMutation.isPending ? 'Analyzing…' : 'Re-analyze'}
                        </button>
                      </div>

                      {drawerAiMutation.isError && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-700 dark:text-red-300">
                          {errMsg(drawerAiMutation.error)}
                        </div>
                      )}

                      <div className="rounded-lg bg-white dark:bg-slate-950/80 p-3 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-[#0f1f3d] dark:text-white">Summary & Executive Impact:</p>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {selectedFinding.aiAnalysis?.summary || selectedFinding.impact || `Automated threat analysis for ${selectedFinding.title}.`}
                        </p>
                      </div>

                      {selectedFinding.aiAnalysis?.priorityReason && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3.5 border border-amber-300 dark:border-amber-500/30 text-xs space-y-1">
                          <span className="font-bold text-amber-900 dark:text-amber-300 block">Priority Rationale:</span>
                          <p className="text-amber-950 dark:text-amber-100 font-medium leading-relaxed">{selectedFinding.aiAnalysis.priorityReason}</p>
                        </div>
                      )}

                      <div className="space-y-2 text-xs">
                        <h5 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">Recommended Remediation Steps:</h5>
                        <div className="space-y-1.5">
                          {(selectedFinding.aiAnalysis?.remediation?.length > 0
                            ? selectedFinding.aiAnalysis.remediation
                            : selectedFinding.remediation || ['Check server-side input validation and security headers.']
                          ).map((step, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-md bg-slate-50 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Code Fix Generator Box */}
                      <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                            <Code2 size={14} /> Express.js Code Fix Snippet
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(getCodeFixSnippet(selectedFinding));
                                setCopiedCode(true);
                                setTimeout(() => setCopiedCode(false), 2000);
                              } catch (e) {}
                            }}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#0f1f3d] dark:hover:text-white"
                          >
                            {copiedCode ? <Check size={11} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={11} />}
                            {copiedCode ? 'Copied!' : 'Copy Code'}
                          </button>
                        </div>
                        <pre className="overflow-x-auto rounded bg-slate-50 dark:bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                          {getCodeFixSnippet(selectedFinding)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                {drawerTab === 'details' && (
                  <div className="space-y-4">
                    {/* Risk Information Card */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-4">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
                        <AlertTriangle className="h-4 w-4" /> Risk Information
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Severity</span>
                          <SeverityBadge severity={selectedFinding.severity} />
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">CVSS Score</span>
                          <span className="font-mono font-bold text-[#0f1f3d] dark:text-white text-sm">{selectedFinding.cvssScore}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">CWE</span>
                          <span className="font-mono text-blue-600 dark:text-cyan-300">{selectedFinding.cweId || 'CWE-862'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">OWASP Top 10</span>
                          <span className="font-mono text-blue-600 dark:text-cyan-300">{selectedFinding.owaspCategory || 'A01:2021'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Affected Asset Card */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-4 space-y-3">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                        <Layers className="h-4 w-4" /> Affected Asset
                      </h4>
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px] block mb-1">Target Endpoint & Method</span>
                          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 font-mono text-[11px] text-blue-600 dark:text-cyan-300 break-all">
                            <span className="shrink-0 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold uppercase text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                              {selectedFinding.httpMethod || 'GET'}
                            </span>
                            <span className="break-all">{selectedFinding.affectedAssets?.[0] || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1 font-mono text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-sans block text-[11px]">Project</span>
                            <span className="text-slate-700 dark:text-slate-200 font-semibold">{selectedFinding.projectId?.name || selectedFinding.project || 'Default Project'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-sans block text-[11px]">Technology</span>
                            <span className="text-slate-700 dark:text-slate-200">{selectedFinding.technology || 'Node.js (Express)'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps Card */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-4">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                        <Clock className="h-4 w-4" /> Timestamps
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-sans block text-[11px]">Detected</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {formatDateTime(selectedFinding.detectedDate || selectedFinding.createdAt).full}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-sans block text-[11px]">Last Updated</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {formatDateTime(selectedFinding.updatedDate || selectedFinding.updatedAt).full}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-sans block text-[11px]">First Seen</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {formatDateTime(selectedFinding.firstSeen || selectedFinding.createdAt).full}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-sans block text-[11px]">Last Seen</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {formatDateTime(selectedFinding.lastSeen || selectedFinding.updatedAt).full}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'evidence' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4">
                      <h4 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        <span>HTTP Request Trace</span>
                        <span className="flex items-center gap-2">
                          <CopyCurlButton finding={selectedFinding} />
                          <span className="font-mono text-[10px] text-blue-600 dark:text-cyan-400">Captured Log</span>
                        </span>
                      </h4>
                      <pre className="overflow-x-auto rounded-lg bg-white dark:bg-slate-950 p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">
                        {selectedFinding.evidence || 'No payload log captured.'}
                      </pre>
                    </div>
                  </div>
                )}

                {drawerTab === 'remediation' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2">Recommended Steps</h4>
                      <ul className="list-disc space-y-2 pl-4 text-xs text-slate-600 dark:text-slate-300">
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
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-950" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Finding Verified</p>
                        <p className="text-[10px] text-slate-500 font-mono">Sep 12, 2026 - 15:08 by Security Lead</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-950" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Moved to Under Review</p>
                        <p className="text-[10px] text-slate-500 font-mono">Sep 12, 2026 - 14:40</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-blue-500 dark:bg-cyan-500 ring-4 ring-white dark:ring-slate-950" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Initial Discovery by Live Scanner</p>
                        <p className="text-[10px] text-slate-500 font-mono">Sep 12, 2026 - 14:32</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/findings/${selectedFinding._id}`)}
                    className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                  >
                    Open Full Page View <ExternalLink className="h-3.5 w-3.5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        verifyMutation.mutate({ id: selectedFinding._id, status: 'Under Review' })
                      }
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                    >
                      Mark Under Review
                    </Button>

                    <Button
                      variant="success"
                      onClick={() =>
                        verifyMutation.mutate({ id: selectedFinding._id, status: 'Verified' })
                      }
                      className="text-xs font-bold shadow-md shadow-emerald-500/25"
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

// Executive Metric Card Helper Component — synced with Reports (icon + flat, no glow)
function MetricCard({ title, value, trend, icon: Icon, color = 'cyan', badgeColor = 'bg-blue-500 dark:bg-cyan-500', tooltip, active, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const toneMap = { cyan: 'cyan', red: 'red', orange: 'amber', amber: 'amber', green: 'emerald', emerald: 'emerald' };
  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={cn(
        "relative overflow-visible border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-3.5 shadow-md transition duration-200 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700",
        active && "bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border-slate-200 dark:border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      )}
    >
      {showTooltip && tooltip && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 shadow-2xl text-[11px] text-slate-600 dark:text-slate-300 pointer-events-none transition duration-150 animate-in fade-in">
          <span className="block font-bold text-blue-600 dark:text-cyan-400 mb-0.5">{title}</span>
          <span>{tooltip}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        {Icon ? (
          <PremiumIcon icon={Icon} tone={toneMap[color] || 'cyan'} size="sm" />
        ) : (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{title}</span>
        )}
        <span className={cn('h-2 w-2 shrink-0 rounded-full', badgeColor)} />
      </div>
      <div className="mt-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white font-mono">{value}</span>
          {trend && <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400">{trend}</span>}
        </div>
        <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 truncate">{title}</p>
      </div>
    </Card>
  );
}

// Progress Bar Helper Component
function SeverityProgressBar({ label, count, total, color, text, onClick }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.round((count / (total || 1)) * 100);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="space-y-1 relative cursor-pointer p-1.5 rounded-lg transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
    >
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className={cn('font-mono font-semibold', text)}>
          {count} <span className="text-slate-500 font-normal text-[10px]">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={cn('h-full rounded-full transition-all duration-500', color, hovered && 'brightness-125')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Interactive Dynamic Findings Trend Sparkline Chart
function FindingsTrendChart({ findings = [] }) {
  const [activePoint, setActivePoint] = useState(null);

  // Compute past 7 days dynamically ending on the current day
  const trendData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Findings detected on or prior to this day
      const activeOnDay = findings.filter((f) => {
        const detectedTime = new Date(f.detectedDate || f.createdAt).getTime();
        return !isNaN(detectedTime) && detectedTime <= endOfDay;
      });

      // Findings newly logged specifically on this day
      const addedOnDay = findings.filter((f) => {
        const detectedTime = new Date(f.detectedDate || f.createdAt).getTime();
        return !isNaN(detectedTime) && detectedTime >= startOfDay && detectedTime <= endOfDay;
      });

      let desc = '';
      if (activeOnDay.length === 0) {
        desc = 'Zero vulnerabilities recorded';
      } else if (i === 0) {
        desc = `${activeOnDay.length} active flaw${activeOnDay.length === 1 ? '' : 's'} currently`;
      } else if (addedOnDay.length > 0) {
        desc = `+${addedOnDay.length} flaw${addedOnDay.length === 1 ? '' : 's'} logged on this date`;
      } else {
        desc = `${activeOnDay.length} active flaw${activeOnDay.length === 1 ? '' : 's'} recorded`;
      }

      days.push({
        date: label,
        count: activeOnDay.length,
        added: addedOnDay.length,
        desc,
      });
    }
    return days;
  }, [findings]);

  // Dynamically calculate SVG coordinate points based on real counts
  const { points, pathD, polygonPoints } = useMemo(() => {
    const maxVal = Math.max(...trendData.map((d) => d.count), 1);
    const width = 300;
    const paddingX = 18;
    const stepX = (width - paddingX * 2) / Math.max(trendData.length - 1, 1);
    const bottomY = 75;
    const topY = 20;

    const pts = trendData.map((d, idx) => {
      const x = Math.round(paddingX + idx * stepX);
      const y = d.count === 0 ? bottomY : Math.round(bottomY - (d.count / (maxVal * 1.18)) * (bottomY - topY));
      return { x, y };
    });

    // Build cubic bezier curve
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = Math.round(p0.x + (p1.x - p0.x) * 0.5);
      const cp1y = p0.y;
      const cp2x = Math.round(p0.x + (p1.x - p0.x) * 0.5);
      const cp2y = p1.y;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }

    // Closed polygon for gradient fill
    const poly = `${pts[0].x},${pts[0].y} ` +
      pts.map((p) => `${p.x},${p.y}`).join(' ') +
      ` ${pts[pts.length - 1].x},${bottomY + 10} ${pts[0].x},${bottomY + 10}`;

    return { points: pts, pathD: d, polygonPoints: poly };
  }, [trendData]);

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4 relative">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Findings Trend (Last 7 Days)</h3>
        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">Last 7 days</span>
      </div>

      <div className="relative mt-3 h-32 w-full">
        {/* Interactive Hover Tooltip Box */}
        {activePoint !== null && points[activePoint] && (
          <div
            className="absolute z-30 pointer-events-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 shadow-xl text-xs font-mono transition duration-150 animate-in fade-in"
            style={{
              left: `${Math.min(Math.max(points[activePoint].x - 60, 0), 180)}px`,
              top: `${Math.max(points[activePoint].y - 45, 0)}px`,
            }}
          >
            <span className="text-blue-600 dark:text-cyan-400 font-bold block">{trendData[activePoint].date}</span>
            <span className="text-[#0f1f3d] dark:text-white font-semibold">
              {trendData[activePoint].count} Active Finding{trendData[activePoint].count === 1 ? '' : 's'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{trendData[activePoint].desc}</span>
          </div>
        )}

        <svg className="h-full w-full overflow-visible" viewBox="0 0 300 90">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeDasharray="3 3" opacity="0.3" />
          <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3 3" opacity="0.3" />
          <line x1="0" y1="75" x2="300" y2="75" stroke="#1e293b" strokeDasharray="3 3" opacity="0.3" />

          <polygon points={polygonPoints} fill="url(#trendGradient)" />
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={activePoint === i ? 6 : 4}
              onMouseEnter={() => setActivePoint(i)}
              onMouseLeave={() => setActivePoint(null)}
              className={cn(
                'cursor-pointer transition-all duration-150',
                activePoint === i
                  ? 'fill-cyan-400 stroke-white stroke-2'
                  : 'fill-slate-900 stroke-cyan-400 stroke-2 hover:fill-cyan-400'
              )}
            />
          ))}
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
          {trendData.map((d) => (
            <span key={d.date}>{d.date}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Interactive Severity Distribution Donut Chart Component
function SeverityDistributionChart({ critical = 0, high = 0, medium = 0, low = 0, total = 0, onSelectSeverity }) {
  const [hoverSegment, setHoverSegment] = useState(null);

  const segments = [
    { label: 'Critical', count: critical, color: '#ef4444' },
    { label: 'High', count: high, color: '#f97316' },
    { label: 'Medium', count: medium, color: '#f59e0b' },
    { label: 'Low', count: low, color: '#10b981' },
  ];

  const C = 2 * Math.PI * 38; // Circumference ~ 238.76

  // Calculate non-overlapping SVG strokeDasharray and strokeDashoffset for each segment
  let currentOffset = 0;
  const renderedSegments = segments.map((seg) => {
    const pct = total > 0 ? seg.count / total : 0;
    const strokeLength = pct * C;
    const strokeGap = C - strokeLength;
    const dashOffset = -currentOffset;
    currentOffset += strokeLength;

    return {
      ...seg,
      pct,
      strokeLength,
      strokeGap,
      dashOffset,
    };
  });

  return (
    <Card className="flex items-center justify-between border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4 relative">
      <div className="flex flex-col justify-between h-full w-full space-y-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Severity Distribution</h3>
          {hoverSegment ? (
            <span className="font-mono text-[10px] text-blue-600 dark:text-cyan-300 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-500/30 animate-in fade-in">
              {hoverSegment.label}: {hoverSegment.count} ({Math.round((hoverSegment.count / (total || 1)) * 100)}%)
            </span>
          ) : (
            <span className="font-mono text-[10px] text-slate-500">Live Breakdown</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 py-1">
          {/* Prominent Enlarged SVG Donut */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg className="h-36 w-36 sm:h-40 sm:w-40 -rotate-90 stroke-slate-800 stroke-[14]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" strokeWidth="14" />
              {total > 0 &&
                renderedSegments.map((seg) => {
                  if (seg.count === 0) return null;
                  const isHovered = hoverSegment?.label === seg.label;
                  return (
                    <circle
                      key={seg.label}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={isHovered ? 18 : 14}
                      strokeDasharray={`${seg.strokeLength} ${seg.strokeGap}`}
                      strokeDashoffset={seg.dashOffset}
                      className="cursor-pointer transition-all duration-200 hover:opacity-95"
                      onClick={() => onSelectSeverity && onSelectSeverity(seg.label)}
                      onMouseEnter={() => setHoverSegment(seg)}
                      onMouseLeave={() => setHoverSegment(null)}
                    />
                  );
                })}
            </svg>
            <div className="absolute text-center pointer-events-none">
              <span className="text-2xl font-black text-[#0f1f3d] dark:text-white font-mono tracking-tight">{hoverSegment ? hoverSegment.count : total}</span>
              <span className="block text-[9px] uppercase tracking-wider text-blue-600 dark:text-cyan-400 font-mono font-bold">
                {hoverSegment ? hoverSegment.label : 'TOTAL CASES'}
              </span>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-1.5 text-xs flex-1">
            {segments.map((seg) => (
              <div
                key={seg.label}
                onClick={() => onSelectSeverity && onSelectSeverity(seg.label)}
                onMouseEnter={() => setHoverSegment(seg)}
                onMouseLeave={() => setHoverSegment(null)}
                className={cn(
                  'flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 transition duration-150',
                  hoverSegment?.label === seg.label ? 'bg-slate-100 dark:bg-slate-800/90 border-blue-200 dark:border-cyan-500/40 text-[#0f1f3d] dark:text-white ring-1 ring-cyan-500/30' : 'hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{seg.label}</span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{seg.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['finding', id],
    queryFn: async () => (await api.get(`/findings/${id}`)).data,
  });

  const verify = useMutation({
    mutationFn: async (status) => (await api.post(`/findings/${id}/verify`, { status })).data,
    onSuccess: (resData) => {
      if (resData?.finding) {
        qc.setQueryData(['finding', id], (old) => (old ? { ...old, finding: resData.finding } : { finding: resData.finding }));
      }
      qc.invalidateQueries({ queryKey: ['finding', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const ai = useMutation({
    mutationFn: async () => (await api.post(`/findings/${id}/ai-analysis`)).data,
    onSuccess: (resData) => {
      if (resData?.finding) {
        qc.setQueryData(['finding', id], (old) => (old ? { ...old, finding: resData.finding } : { finding: resData.finding }));
      }
      qc.invalidateQueries({ queryKey: ['finding', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
    },
  });

  const retest = useMutation({
    mutationFn: async ({ result, notes }) => (await api.post(`/findings/${id}/retest`, { result, notes })).data,
    onSuccess: (resData) => {
      if (resData?.finding) {
        qc.setQueryData(['finding', id], (old) => (old ? { ...old, finding: resData.finding } : { finding: resData.finding }));
      }
      qc.invalidateQueries({ queryKey: ['finding', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const res = await api.get(`/findings/${id}/pdf`);
      if (res.data?.fileUrl) {
        const link = document.createElement('a');
        link.href = res.data.fileUrl;
        link.download = res.data.fileName || `vulnerability-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Failed to download finding PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading detailed vulnerability breakdown..." />;
  if (isError || !data?.finding) return <ErrorState message="Finding record not found." onRetry={() => refetch()} />;

  const v = data.finding;

  // Extract structured dynamic values with fallbacks
  const stepsToReproduce =
    (v.stepsToReproduce && v.stepsToReproduce.length > 0)
      ? v.stepsToReproduce
      : (v.aiAnalysis?.stepsToReproduce && v.aiAnalysis.stepsToReproduce.length > 0)
      ? v.aiAnalysis.stepsToReproduce
      : [
          `Send request to affected asset: ${(v.affectedAssets || [])[0] || 'Target Endpoint'}`,
          `Inspect HTTP response payload and security headers.`,
          `Verify missing security control or misconfiguration.`,
        ];

  const proofOfConcept =
    v.proofOfConcept ||
    v.aiAnalysis?.proofOfConcept ||
    v.evidence ||
    `curl -i -X ${v.httpTrace?.method || 'GET'} "${(v.affectedAssets || [])[0] || 'http://localhost:3001/api'}"`;

  const businessImpact =
    v.businessImpact ||
    v.aiAnalysis?.businessImpact ||
    v.impact ||
    'Potential vulnerability exploitation could lead to unauthorized data exposure, session hijacking, or regulatory non-compliance.';

  const remediationSteps =
    (v.remediation && v.remediation.length > 0)
      ? v.remediation
      : (v.aiAnalysis?.remediation && v.aiAnalysis.remediation.length > 0)
      ? v.aiAnalysis.remediation
      : ['Enforce strict security policy headers.', 'Implement input validation and authorization checks.'];

  const ethicalConstraints = v.remediationConstraints || [
    'Testing must be performed only on authorized systems.',
    'No actions should affect production users or data.',
    'Exploitation should be limited to proof-of-concept validation.',
    'Compliance with applicable laws, policies, and ethical hacking guidelines is required.',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/findings');
            }
          }}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition duration-200 hover:border-blue-300 dark:hover:border-cyan-500/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-cyan-400 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Findings</span>
        </button>

        {/* Download PDF Button */}
        <Button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="bg-blue-600/80 backdrop-blur-xl border border-white/40 hover:bg-blue-600/90 text-white text-xs font-bold flex items-center gap-2 shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35"
        >
          <Download className={cn("h-4 w-4", isDownloadingPdf && "animate-bounce")} />
          <span>{isDownloadingPdf ? 'Generating PDF Report…' : 'Download Vulnerability PDF'}</span>
        </Button>
      </div>

      {/* Main Vulnerability Header */}
      <PageHeader
        title={`${v.findingId} · ${v.title}`}
        subtitle={`${v.category || 'Security Finding'} · CVSS ${v.cvssScore}`}
        actions={
          <div className="flex items-center gap-2">
            <SeverityBadge severity={v.severity} />
            <StatusBadge status={v.status} />
            {v.retestStatus === 'PASSED' && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-3 py-1 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm animate-in fade-in duration-150">
                <CheckCircle2 className="h-3.5 w-3.5" />
                VERIFIED - PASSED
              </span>
            )}
            {v.retestStatus === 'FAILED' && (
              <span className="rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40 px-3 py-1 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm animate-in fade-in duration-150">
                <XCircle className="h-3.5 w-3.5" />
                RETEST FAILED
              </span>
            )}
            {v.retestStatus === 'REQUIRED' && (
              <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 px-3 py-1 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm animate-in fade-in duration-150">
                <RotateCcw className="h-3.5 w-3.5" />
                RETEST REQUIRED
              </span>
            )}
          </div>
        }
      />

      {/* Synergistic Scanner + AI Conclusion - Spans Full Width */}
      <CombinedConclusionCard finding={v} />

      {/* 2-Column Overview & Triage Grid: Left has Details, Right has Scores & Status Actions */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Overview, Component, Impact */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Vulnerability Overview */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600 dark:text-cyan-400" /> Vulnerability Description & Metadata
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{v.description || 'No detailed description available.'}</p>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              {(v.cwe || v.cweId) && (
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-mono text-[11px] font-semibold text-blue-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">
                  CWE: {v.cwe || v.cweId}
                </span>
              )}
              {(v.owasp || v.owaspCategory) && (
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700">
                  OWASP: {v.owasp || v.owaspCategory}
                </span>
              )}
              {v.retestStatus && v.retestStatus !== 'NOT_REQUIRED' && (
                <span className={cn(
                  "rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold ring-1",
                  v.retestStatus === 'PASSED'
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-400/40"
                    : v.retestStatus === 'FAILED'
                    ? "bg-red-500/15 text-red-700 dark:text-red-300 ring-red-400/40"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-400/40"
                )}>
                  RETEST: {v.retestStatus}
                </span>
              )}
              {v.slaDueAt && <SlaBadge dueAt={v.slaDueAt} />}
            </div>
          </Card>

          {/* 2. Affected Component */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600 dark:text-cyan-400" /> Affected Component & Endpoint
            </h3>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 font-mono text-xs text-blue-600 dark:text-cyan-300 break-all flex items-center gap-3">
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold uppercase text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shrink-0">
                {v.httpTrace?.method || 'GET'}
              </span>
              <span>{(v.affectedAssets || []).join(', ') || 'N/A'}</span>
            </div>
          </Card>

          {/* 3. Business Impact Assessment */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 border-l-4 border-l-red-500 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" /> Business Impact Assessment
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-red-950/20 p-3 rounded-lg border border-red-900/30">
              {businessImpact}
            </p>
          </Card>

          {/* 4. Regulatory Compliance Impact & Threat Vector Matrix */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Regulatory Compliance & Threat Vector Matrix
              </h3>
              <span className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 uppercase">
                Audit Impact: High
              </span>
            </div>

            {/* Compliance Standards Impact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">PCI-DSS 4.0</span>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase">Req 6.5 Failure</p>
                <p className="text-[10px] text-slate-500 leading-tight">Web application & API misconfiguration</p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">GDPR Art. 32</span>
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold uppercase">Exposure Risk</p>
                <p className="text-[10px] text-slate-500 leading-tight">Inadequate technical data safeguards</p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">ISO 27001</span>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">Ctrl A.8.20</p>
                <p className="text-[10px] text-slate-500 leading-tight">Network & perimeter boundary lapse</p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">SOC 2 Type II</span>
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                </div>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase">Criteria CC6.1</p>
                <p className="text-[10px] text-slate-500 leading-tight">Logical & remote access vulnerability</p>
              </div>
            </div>

            {/* Exploitability & Attack Vectors */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Attack Vector & Exploitability Profile:
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Remotely Exploitable</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div className="rounded bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Vector</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-300">Network (AV:N)</span>
                </div>
                <div className="rounded bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Complexity</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Low (AC:L)</span>
                </div>
                <div className="rounded bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Privileges</span>
                  <span className="font-bold text-purple-600 dark:text-purple-300">None (PR:N)</span>
                </div>
                <div className="rounded bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">User Action</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">None (UI:N)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: CVSS Score, AI Trigger, Update Status, Fix Verification */}
        <div className="space-y-6 lg:col-span-5">
          {/* CVSS Metric Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 text-center shadow-lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CVSS v3 Score</h3>
            <div className="mt-2 text-4xl font-extrabold text-[#0f1f3d] dark:text-white font-mono">{v.cvssScore}</div>
            <div className="mt-3 flex justify-center">
              <SeverityBadge severity={v.severity} />
            </div>
          </Card>

          {/* AI Security Analysis Trigger */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                <Code2 className="h-4 w-4 text-blue-600 dark:text-cyan-400" /> AI Security Analysis
              </h3>
              <Button
                variant="outline"
                disabled={ai.isPending}
                onClick={() => ai.mutate()}
                className="text-xs flex items-center gap-1"
              >
                <RefreshCw className={cn('h-3 w-3', ai.isPending && 'animate-spin')} />
                {ai.isPending ? 'Analyzing…' : 'Refresh AI Analysis'}
              </Button>
            </div>

            {v.aiAnalysis?.classification ? (
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <b className="text-[#0f1f3d] dark:text-white">Classification:</b> {v.aiAnalysis.classification} ({v.aiAnalysis.confidence}%)
                </p>
                <p>
                  <b className="text-[#0f1f3d] dark:text-white">Summary:</b> {v.aiAnalysis.summary}
                </p>
                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {v.aiAnalysis.priorityReason} · Presented as AI assistance.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No AI analysis generated yet — click Refresh AI Analysis above.</p>
            )}
            {ai.isError && <p className="text-xs text-red-600 dark:text-red-400">{errMsg(ai.error)}</p>}
          </Card>

          {/* Verification Workflow - Clearly Highlight Active Button */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Update Status</h3>
              <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase bg-blue-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-500/30">
                Active: {v.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Under Review', 'Verified', 'False Positive', 'Resolved'].map((st) => {
                const isActive = (v.status || '').toLowerCase() === st.toLowerCase();
                return (
                  <Button
                    key={st}
                    variant={isActive ? 'default' : 'outline'}
                    disabled={verify.isPending}
                    onClick={() => verify.mutate(st)}
                    className={cn(
                      "text-xs py-2 font-bold transition-all duration-150 flex items-center justify-center gap-1.5",
                      isActive
                        ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md ring-2 ring-blue-500/60 dark:ring-cyan-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 hover:border-blue-400 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {isActive && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    <span>Mark {st}</span>
                  </Button>
                );
              })}
            </div>
            {verify.isError && <p className="text-xs text-red-600 dark:text-red-400">{errMsg(verify.error)}</p>}
          </Card>

          {/* Fix Verification / Retest - Clearly Highlight Active Button */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <RotateCcw className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" /> Fix Verification
              </h3>
              {v.retestStatus && v.retestStatus !== 'NOT_REQUIRED' && (
                <span className={cn(
                  "font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                  v.retestStatus === 'PASSED'
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : v.retestStatus === 'FAILED'
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                )}>
                  {v.retestStatus}
                </span>
              )}
            </div>
            {v.retestNotes && <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Last retest notes: {v.retestNotes}</p>}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={v.retestStatus === 'REQUIRED' ? 'default' : 'outline'}
                disabled={retest.isPending}
                onClick={() => retest.mutate({ result: 'REQUIRED', notes: 'Retest requested by analyst' })}
                className={cn(
                  "text-xs py-2 font-bold transition-all duration-150 flex items-center justify-center gap-1",
                  v.retestStatus === 'REQUIRED'
                    ? "bg-amber-600 text-white ring-2 ring-amber-400/60 shadow-md"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {v.retestStatus === 'REQUIRED' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                Request Retest
              </Button>
              <Button
                variant={v.retestStatus === 'PASSED' ? 'default' : 'outline'}
                disabled={retest.isPending}
                onClick={() => retest.mutate({ result: 'PASSED', notes: 'Fix confirmed and verified' })}
                className={cn(
                  "text-xs py-2 font-bold transition-all duration-150 flex items-center justify-center gap-1",
                  v.retestStatus === 'PASSED'
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md"
                    : "border-emerald-500/40 bg-white dark:bg-slate-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
                )}
              >
                {v.retestStatus === 'PASSED' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                Pass
              </Button>
              <Button
                variant={v.retestStatus === 'FAILED' ? 'default' : 'outline'}
                disabled={retest.isPending}
                onClick={() => retest.mutate({ result: 'FAILED', notes: 'Vulnerability still reproducible' })}
                className={cn(
                  "text-xs py-2 font-bold transition-all duration-150 flex items-center justify-center gap-1",
                  v.retestStatus === 'FAILED'
                    ? "bg-red-600 text-white ring-2 ring-red-400 shadow-md"
                    : "border-red-500/40 bg-white dark:bg-slate-950/60 text-red-700 dark:text-red-300 hover:bg-red-500/15"
                )}
              >
                {v.retestStatus === 'FAILED' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                Fail
              </Button>
            </div>
            {retest.isError && <p className="text-xs text-red-600 dark:text-red-400">{errMsg(retest.error)}</p>}
          </Card>
        </div>
      </div>

      {/* FULL WIDTH TECHNICAL SECTIONS (Zero Empty Right Space) */}
      <div className="space-y-6">
        {/* 4. Steps to Reproduce */}
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Steps to Reproduce (AI Verified)
          </h3>
          <div className="space-y-2.5 pt-1">
            {stepsToReproduce.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                  {idx + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 5. Proof of Concept (PoC) */}
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-600 dark:text-cyan-400" /> Proof of Concept (Safe Testing Demonstration)
            </h3>
            <CopyCurlButton finding={v} />
          </div>
          <pre className="overflow-x-auto rounded-lg bg-white dark:bg-slate-950 p-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 leading-relaxed">
            {proofOfConcept}
          </pre>
        </Card>

        {/* Saksham AI Remediation Blueprint & Configuration Playbook */}
        <PenteraRemediationWiki finding={v} />

        {/* 6. Remediation Recommendations */}
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Remediation Recommendations
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {remediationSteps.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 7. Safe Testing & Ethical Constraints Notice */}
        <Card className="border-cyan-900/40 bg-blue-50 dark:bg-cyan-950/15 p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-cyan-400" /> Rules of Engagement & Ethical Hacking Constraints
          </h3>
          <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300">
            {ethicalConstraints.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Side-by-Side Reference Guides: Rating Matrix & Security Glossary */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* CVSS v3.1 Severity Score Scale Guide */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-cyan-400" /> CVSS v3.1 Rating Matrix & Scale Guide
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              CVSS (Common Vulnerability Scoring System) quantifies vulnerability severity from 0.0 to 10.0 based on exploitability, impact, and access complexity:
            </p>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-950/30 p-2 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span className="font-bold text-red-700 dark:text-red-300">9.0 – 10.0</span>
                </div>
                <span className="font-mono text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Critical (RCE / Auth Bypass)</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-950/30 p-2 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                  <span className="font-bold text-orange-700 dark:text-orange-300">7.0 – 8.9</span>
                </div>
                <span className="font-mono text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase">High (IDOR / SQLi)</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-950/30 p-2 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-amber-700 dark:text-amber-300">4.0 – 6.9</span>
                </div>
                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Medium (Missing CSP / CORS)</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">0.1 – 3.9</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Low (Info Leak / Headers)</span>
              </div>
            </div>
          </Card>

          {/* Technical Security Terms & Security Glossary */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-5 space-y-3 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Technical Terms & Security Glossary
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-0.5">
                <span className="font-mono font-bold text-blue-600 dark:text-cyan-300 text-[11px] block">CWE (Common Weakness Enumeration)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Community dictionary of software flaw types (e.g. CWE-306 for Broken Authentication).</p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-0.5">
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-[11px] block">OWASP Top 10</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Standard awareness framework identifying top security risks in web applications & APIs.</p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-0.5">
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-[11px] block">PoC (Proof of Concept)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">A safe HTTP trace or cURL command validating vulnerability existence without destroying data.</p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 space-y-0.5">
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px] block">IDOR / BOLA</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Broken Object Level Authorization where manipulating object IDs exposes unauthorized records.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

