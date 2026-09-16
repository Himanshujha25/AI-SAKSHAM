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
  ShieldAlert, ChevronRight, LayoutDashboard, Terminal, Sparkles, Key
} from 'lucide-react';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { parseCurlCommand } from '../../lib/utils';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge, SeverityBadge, MicroLabel, PremiumIcon } from '../../components/shared/shared';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useAuth } from '../../store/auth';

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
  { key: 'Critical', label: 'Critical', icon: AlertOctagon, color: '#ef4444', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' },
  { key: 'High', label: 'High', icon: AlertTriangle, color: '#f97316', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  { key: 'Medium', label: 'Medium', icon: BarChart2, color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { key: 'Low', label: 'Low', icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
];

// Professional Security Analysis Pipeline Node
function SecurityAnalysisHub({ value, score, isScanning, activeStage, orbRef }) {
  return (
    <div ref={orbRef} className="relative mx-auto flex h-52 w-52 items-center justify-center md:h-60 md:w-60">
      {/* Structural Dual Rings */}
      <div className="absolute inset-0 rounded-full border border-blue-100 bg-white shadow-inner dark:border-slate-700/60 dark:bg-[#070d1a]" />
      <div className="absolute inset-2 rounded-full border border-cyan-500/20 bg-blue-50/60 shadow-xl flex items-center justify-center dark:bg-[#091024]">
        <div className="absolute inset-3 rounded-full border border-blue-100 dark:border-slate-800/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-cyan-500/30 text-blue-600 dark:bg-cyan-950 dark:text-cyan-400">
          <ShieldCheck size={22} className={isScanning ? 'animate-pulse' : ''} />
        </div>

        {isScanning ? (
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 animate-pulse block">
              {activeStage || 'ANALYSIS IN PROGRESS'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Processing Pipeline...</span>
          </div>
        ) : (
          <div>
            <span className="text-3xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white block">{value}</span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tracked Findings</span>
            <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-600 dark:border-cyan-500/30 dark:bg-cyan-950/60 dark:text-cyan-300">
              SCORE {score ?? '—'}/100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Start Scan Modal Form
// Start Scan Wizard Modal Form (3 Steps)
function StartScanModal({ isOpen, onClose, onLaunched }) {
  const [step, setStep] = useState(1);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('new');
  const [projectName, setProjectName] = useState('World Monitor Assessment');
  const [targetName, setTargetName] = useState('World Monitor Core API');
  const [targetUrl, setTargetUrl] = useState('http://localhost:3001/api/ask');
  const [method, setMethod] = useState('POST');
  
  // Dedicated Auth Fields
  const [bearerToken, setBearerToken] = useState('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzJ0ZXN0MTIzNDU2Nzg5Iiwib3JnX3Rlc3QxMjMiLCJyb2xlIjoicHJvIn0.xyz');
  const [apiKey, setApiKey] = useState('wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3');
  const [additionalHeaders, setAdditionalHeaders] = useState('');
  
  const [requestBody, setRequestBody] = useState('{\n  "query": "What are current active military flight vectors?",\n  "variant": "full"\n}');
  const [environment, setEnvironment] = useState('Testing');
  const [scanType, setScanType] = useState('Standard');
  const [curlInput, setCurlInput] = useState('');
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing projects for dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/projects')
        .then((res) => {
          const list = res.data?.projects || [];
          setProjectsList(list);
          if (list.length > 0) {
            setSelectedProjectId(list[0]._id);
            setProjectName(list[0].name);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProjectSelect = (val) => {
    setSelectedProjectId(val);
    if (val === 'new') {
      setProjectName('New Security Project');
    } else {
      const p = projectsList.find((proj) => proj._id === val);
      if (p) setProjectName(p.name);
    }
  };

  const handleParseCurl = () => {
    if (!curlInput || !curlInput.trim()) return;
    const parsed = parseCurlCommand(curlInput);
    if (parsed) {
      if (parsed.url) setTargetUrl(parsed.url);
      if (parsed.method) setMethod(parsed.method);
      if (parsed.body) setRequestBody(parsed.body);

      if (parsed.headers) {
        const lines = (Array.isArray(parsed.headers) ? parsed.headers.join('\n') : String(parsed.headers)).split('\n');
        const extra = [];
        let foundBearer = false;
        let foundApiKey = false;

        lines.forEach((line) => {
          const clean = line.trim();
          if (/^authorization:\s*bearer\s+/i.test(clean)) {
            setBearerToken(clean.replace(/^authorization:\s*bearer\s+/i, '').trim());
            foundBearer = true;
          } else if (/^x-api-key:\s*/i.test(clean)) {
            setApiKey(clean.replace(/^x-api-key:\s*/i, '').trim());
            foundApiKey = true;
          } else if (clean) {
            extra.push(clean);
          }
        });
        if (!foundBearer) setBearerToken('');
        if (!foundApiKey) setApiKey('');
        setAdditionalHeaders(extra.join('\n'));
      }

      try {
        const parsedUrl = new URL(parsed.url);
        setTargetName(`${parsed.method} ${parsedUrl.pathname}`);
      } catch (e) {
        setTargetName(`${parsed.method} ${parsed.url}`);
      }
    }
  };

  const buildFinalCustomHeaders = () => {
    const parts = [];
    if (bearerToken && bearerToken.trim()) {
      const raw = bearerToken.trim();
      const tokenStr = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : raw;
      parts.push(`Authorization: Bearer ${tokenStr}`);
    }
    if (apiKey && apiKey.trim()) {
      const rawKey = apiKey.trim();
      const keyStr = rawKey.toLowerCase().startsWith('x-api-key:') ? rawKey.slice(10).trim() : rawKey;
      parts.push(`X-API-Key: ${keyStr}`);
    }
    if (additionalHeaders && additionalHeaders.trim()) {
      parts.push(additionalHeaders.trim());
    }
    return parts.join('\n');
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!targetUrl || !targetUrl.trim()) {
      setErrorMsg('Target URL is required.');
      return;
    }
    if (!projectName || !projectName.trim()) {
      setErrorMsg('Project name is required.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!authorizationConfirmed) {
      setErrorMsg('You must confirm authorization before starting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let projectId = selectedProjectId;
      if (selectedProjectId === 'new') {
        const existingProj = projectsList.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
        if (existingProj) {
          projectId = existingProj._id;
        } else {
          const newProjRes = await api.post('/projects', { name: projectName, description: `Security assessment for ${targetName}` });
          projectId = newProjRes.data.project._id;
        }
      }

      const customHeadersStr = buildFinalCustomHeaders();

      const targetRes = await api.post(`/projects/${projectId}/targets`, {
        name: targetName,
        url: targetUrl,
        method,
        requestBody,
        environment,
        customHeaders: customHeadersStr,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative my-auto w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091024] p-4 sm:p-6 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-[#0f1f3d] dark:text-slate-100 font-bold text-sm sm:text-base">
            <Zap className="text-blue-600 dark:text-cyan-400" size={18} />
            <span>Start Security Assessment</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Close Assessment Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="mt-3 grid grid-cols-3 gap-2 shrink-0 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div
            onClick={() => step > 1 && setStep(1)}
            className={`cursor-pointer rounded-lg p-2 transition flex flex-col gap-0.5 border ${
              step === 1 ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-cyan-500/40 dark:bg-cyan-950/40 dark:text-cyan-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-400'
            }`}
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Step 1</span>
            <span className="text-xs font-semibold truncate">Target & Project</span>
          </div>
          <div
            onClick={() => step > 2 && setStep(2)}
            className={`cursor-pointer rounded-lg p-2 transition flex flex-col gap-0.5 border ${
              step === 2 ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-cyan-500/40 dark:bg-cyan-950/40 dark:text-cyan-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-400'
            }`}
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Step 2</span>
            <span className="text-xs font-semibold truncate">Auth & Payload</span>
          </div>
          <div
            className={`rounded-lg p-2 transition flex flex-col gap-0.5 border ${
              step === 3 ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-cyan-500/40 dark:bg-cyan-950/40 dark:text-cyan-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-400'
            }`}
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Step 3</span>
            <span className="text-xs font-semibold truncate">Scope & Launch</span>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="mt-3 rounded-xl border border-red-500/50 bg-red-950/90 p-3.5 text-xs text-red-200 font-mono break-words break-all max-h-32 overflow-y-auto shadow-xl flex items-start justify-between gap-3 shrink-0">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5">
                <div className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Assessment Launch Error</div>
                <div className="leading-relaxed text-red-200">{errorMsg}</div>
              </div>
            </div>
            <button type="button" onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Wizard Form Container */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          {/* STEP 1: Target & Project Info */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              {/* Rapid cURL Auto-Importer */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-cyan-500/30 dark:bg-gradient-to-r dark:from-cyan-950/30 dark:to-slate-900/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400">
                    <Terminal size={14} /> Fast cURL CLI Auto-Importer
                  </label>
                  {curlInput && (
                    <button
                      type="button"
                      onClick={handleParseCurl}
                      className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-300 hover:bg-cyan-500/30 transition"
                    >
                      ⚡ Auto-Parse cURL
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  placeholder='curl -X POST "http://localhost:3001/api/ask" -H "Authorization: Bearer <token>" -d "{\"query\": \"test\"}"'
                  value={curlInput}
                  onChange={(e) => setCurlInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2.5 font-mono text-[11px] text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
                {curlInput && (
                  <p className="text-[10px] text-blue-600 dark:text-cyan-400/80 font-mono">
                    Auto-parses URL, Method, Bearer Token, API Key & Body across all 3 steps!
                  </p>
                )}
              </div>

              {/* Project Selection / Creation */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Workspace / Project Selection
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <CustomSelect
                    value={selectedProjectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    options={[
                      { value: 'new', label: '+ Create New Project Workspace' },
                      ...projectsList.map((p) => ({ value: p._id, label: p.name })),
                    ]}
                  />
                  {selectedProjectId === 'new' && (
                    <input
                      type="text"
                      placeholder="Enter New Project Name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Target Endpoint & Method */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Target Method & URL Endpoint
                </label>
                <div className="flex gap-2">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className={`rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold font-mono focus:border-cyan-500 focus:outline-none ${
                      method === 'GET' ? 'text-emerald-600 dark:text-emerald-400' :
                      method === 'POST' ? 'text-amber-600 dark:text-amber-400' :
                      method === 'PUT' ? 'text-blue-600 dark:text-cyan-400' :
                      method === 'DELETE' ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    <option value="GET" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold">GET</option>
                    <option value="POST" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold">POST</option>
                    <option value="PUT" className="bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 font-bold">PUT</option>
                    <option value="PATCH" className="bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 font-bold">PATCH</option>
                    <option value="DELETE" className="bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-bold">DELETE</option>
                  </select>
                  <div className="relative flex-1">
                    <Globe size={14} className="absolute left-3 top-3 text-blue-600 dark:text-cyan-400" />
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-9 pr-3.5 py-2 font-mono text-xs text-blue-600 dark:text-cyan-300 focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Target Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Target Name</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-5 py-2 font-mono text-xs font-bold uppercase text-blue-600 hover:bg-blue-100 transition dark:bg-cyan-600/30 dark:border-cyan-500/50 dark:text-cyan-300 dark:hover:bg-cyan-600/50"
                >
                  <span>Next: Auth & Headers</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Authentication & Custom Headers */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-cyan-500/20 dark:bg-cyan-950/20 p-3 text-xs text-blue-600 dark:text-cyan-300 flex items-center gap-2">
                <Key size={16} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Configure dedicated Bearer JWT session tokens, API keys, and request payload below.</span>
              </div>

              {/* Dedicated Bearer JWT Input Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bearer JWT Token
                  </label>
                  <button
                    type="button"
                    onClick={() => setBearerToken('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzJ0ZXN0MTIzNDU2Nzg5Iiwib3JnX3Rlc3QxMjMiLCJyb2xlIjoicHJvIn0.xyz')}
                    className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] text-blue-600 dark:text-cyan-300 hover:bg-cyan-500/20"
                  >
                    + Sample JWT
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Paste raw JWT or Bearer eyJhbG..."
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3.5 py-2 font-mono text-xs text-blue-600 dark:text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Dedicated X-API-Key Input Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Developer API Key (X-API-Key)
                  </label>
                  <button
                    type="button"
                    onClick={() => setApiKey('wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3')}
                    className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                  >
                    + Sample Key
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Paste API Key e.g. wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3.5 py-2 font-mono text-xs text-amber-700 dark:text-amber-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Additional Headers / Cookies Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Additional HTTP Headers / Cookies (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Cookie: session=xyz123&#10;X-Custom-Header: value"
                  value={additionalHeaders}
                  onChange={(e) => setAdditionalHeaders(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* JSON Request Body Payload */}
              {method !== 'GET' && (
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      JSON Request Body Payload
                    </label>
                    <textarea
                      rows={3}
                      placeholder='{ "query": "What are active vectors?", "variant": "full" }'
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 font-mono text-xs leading-relaxed text-amber-700 dark:text-amber-300 placeholder-slate-400 dark:placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-5 py-2 font-mono text-xs font-bold uppercase text-blue-600 hover:bg-blue-100 transition dark:bg-cyan-600/30 dark:border-cyan-500/50 dark:text-cyan-300 dark:hover:bg-cyan-600/50"
                >
                  <span>Next: Scope & Profile</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Environment, Profile & Launch Confirmation */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Environment</label>
                  <CustomSelect
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    options={['Testing', 'Staging', 'Production']}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Audit Profile</label>
                  <CustomSelect
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value)}
                    options={[
                      { value: 'Standard', label: 'Standard Audit' },
                      { value: 'Quick', label: 'Quick Recon' },
                      { value: 'Comprehensive', label: 'Comprehensive Audit' },
                    ]}
                  />
                </div>
              </div>

              {/* Configuration Summary Card */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600 dark:text-cyan-400" /> Target Assessment Summary
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white dark:bg-slate-950/60 p-2 rounded border border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Project</span>
                    <span className="text-[#0f1f3d] dark:text-white font-semibold truncate block">{projectName}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/60 p-2 rounded border border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Endpoint</span>
                    <span className="text-blue-600 dark:text-cyan-300 font-semibold truncate block">{method} {targetUrl}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/60 p-2 rounded border border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Auth Credentials</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                      {bearerToken ? 'Bearer JWT' : ''} {apiKey ? 'X-API-Key' : ''} {!bearerToken && !apiKey ? 'Public/None' : ''}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-950/60 p-2 rounded border border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Scope</span>
                    <span className="text-amber-700 dark:text-amber-300 font-semibold block">{scanType} ({environment})</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={authorizationConfirmed}
                    onChange={(e) => setAuthorizationConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    I explicitly confirm authorization to assess this target URL.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600/80 backdrop-blur-xl border border-white/40 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35"
                >
                  {isSubmitting ? <Cpu size={14} className="animate-spin text-white" /> : <Play size={14} className="fill-current" />}
                  {isSubmitting ? 'Starting...' : '🚀 Launch Assessment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isViewer = user?.role === 'VIEWER';
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
      {/* Header Bar — synced with Reports/Findings with RBAC context */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <PremiumIcon icon={LayoutDashboard} tone={isAdmin ? "purple" : isViewer ? "emerald" : "cyan"} size="lg" iconSize={22} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-[#0f1f3d] dark:text-white">
                {isAdmin ? 'Security Command Center (Admin Console)' : isViewer ? 'Security Compliance Audit Center' : 'Security Operations Center'}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider ${
                isAdmin 
                  ? 'border border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300'
                  : isViewer 
                  ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'border border-cyan-500/40 bg-cyan-500/15 text-blue-600 dark:text-cyan-300'
              }`}>
                {isAdmin ? <Lock size={11} /> : isViewer ? <Eye size={11} /> : <ShieldCheck size={11} />}
                <span>{isAdmin ? 'ADMIN' : isViewer ? 'AUDITOR' : 'ANALYST'}</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isAdmin 
                ? 'Administrative console · Authorized scope & assessments'
                : isViewer 
                ? 'Read-only compliance mode · Verified vulnerability posture'
                : 'Live attack surface posture & security audit pipeline'}
            </p>
          </div>
        </div>

        {isViewer ? (
          <div
            title="Viewer accounts have read-only compliance access."
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/30 px-3.5 py-2 min-h-[44px] font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-300 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Read-Only Auditor Mode</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl border border-purple-500/30 bg-purple-500/10 font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" /> Admin Privileges
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl min-h-[44px] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider bg-blue-600/80 backdrop-blur-xl border border-white/40 hover:bg-blue-600/90 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35"
            >
              <Zap size={14} className="fill-current text-white" />
              <span>Start Assessment</span>
            </button>
          </div>
        )}
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
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 dark:border-cyan-500/30 dark:bg-cyan-950/30 p-3.5">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <p className="text-xs font-bold text-[#0f1f3d] dark:text-white flex items-center gap-2">
                Active Assessment Pipeline Executing...
              </p>
              <p className="text-[11px] font-mono text-blue-600 dark:text-cyan-300 mt-0.5">
                Stage: {activeStage || 'RECONNAISSANCE & PROBING'}
              </p>
            </div>
          </div>
          <Link to={`/assessments/${latestId}`} className="rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:bg-white/90 dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.12]">
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
        className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090f1f] p-6 shadow-xl"
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
                <path d={path.d} fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                <path d={path.d} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <path d={path.d} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" className="pipeline-stream" opacity="0.8" />
                <circle cx={path.startX} cy={path.startY} r="3" fill="#0ea5e9" />
                <circle cx={path.endX} cy={path.endY} r="3" fill="#0ea5e9" />
              </g>
            ))}

            {/* Right Result Paths */}
            {wireData.rightPaths.map((path) => (
              <g key={path.id}>
                <path d={path.d} fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                <path d={path.d} fill="none" stroke={path.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <path d={path.d} fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" className="pipeline-stream" opacity="0.7" />
                <circle cx={path.startX} cy={path.startY} r="3" fill={path.color} />
                <circle cx={path.endX} cy={path.endY} r="3" fill={path.color} />
              </g>
            ))}
          </svg>
        )}

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_1fr_1.2fr] lg:items-center">
          {/* Left Column: Attack Surface Sources (Order 3 on mobile, Order 1 on desktop) */}
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.35 }} className="order-3 lg:order-1 min-w-0">
            <div className="mb-3.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Radar size={13} className="text-blue-600 dark:text-cyan-400" /> SOURCES · ATTACK SURFACE
            </div>
            <ul className="flex flex-col gap-2">
              {LEFT_ITEMS.map((item, idx) => (
                <li
                  key={item.key}
                  ref={(el) => (leftRefs.current[idx] = el)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c18] px-3.5 py-2.5 text-xs font-semibold transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#0a1224]"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-50 border border-blue-100 text-blue-600 dark:bg-slate-900 dark:border-slate-800 dark:text-cyan-400">
                      <item.icon size={13} />
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-200">{item.label}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 rounded bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5">
                    {assetsQuery.isLoading ? '…' : (counts[item.key] || 0)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Center Column: Security Analysis Hub Node (Order 1 on mobile, Order 2 on desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
            className="order-1 lg:order-2 min-w-0 text-center"
          >
            <SecurityAnalysisHub
              orbRef={orbRef}
              value={data.totalFindings}
              score={data.securityScore}
              isScanning={isScanning}
              activeStage={activeStage}
            />
          </motion.div>

          {/* Right Column: Active Cases & Resolved Signals (Order 2 on mobile, Order 3 on desktop) */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.35 }} className="order-2 lg:order-3 min-w-0 space-y-4">
            <div>
              <div className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                ACTIVE CASES ({activeTotal})
              </div>
              <div className="flex flex-col gap-2">
                {RIGHT_ITEMS_SEV.map((item, i) => (
                  <div
                    key={item.key}
                    ref={(el) => (rightRefs.current[i] = el)}
                  >
                    <Link to="/findings" className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c18] px-3.5 py-2.5 text-xs font-semibold transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#0a1224]">
                      <span className="flex items-center gap-2.5">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${item.bg}`}>
                          <item.icon size={13} />
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-[#0f1f3d] dark:text-white">{sev[item.key] || 0}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <BadgeCheck size={13} className="text-emerald-600 dark:text-emerald-400" /> RESOLVED SIGNAL
              </div>
              <div
                ref={(el) => (rightRefs.current[4] = el)}
                className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c18] px-3.5 py-2.5 text-xs font-semibold transition hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-[#0a1224]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-600 dark:border-cyan-500/30 dark:bg-cyan-950/60 dark:text-cyan-400">
                    <ShieldCheck size={13} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">Verified Findings</span>
                </span>
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-cyan-400">{data.verifiedFindings}</span>
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
            <h2 className="text-sm font-bold text-[#0f1f3d] dark:text-white flex items-center gap-2 tracking-wide uppercase font-mono">
              <Activity size={15} className="text-blue-600 dark:text-cyan-400" />
              Assessment Activity Stream
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
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
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060a14] p-2.5 transition duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        isStarted ? 'bg-cyan-500/10 border-cyan-500/30 text-blue-600 dark:text-cyan-400' :
                        isQueued ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' :
                        isCreated ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400' :
                        'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                      }`}>
                        {isStarted ? <Play size={11} /> :
                         isQueued ? <Clock size={11} /> :
                         isCreated ? <FolderPlus size={11} /> :
                         <Activity size={11} />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#0f1f3d] dark:text-white truncate">{a.action}</span>
                          {a.detail && (
                            <span className="rounded border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/90 px-1.5 py-0.2 font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300">
                              {a.detail}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Security Assessment Event Execution
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400">
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
              <h2 className="text-sm font-bold text-[#0f1f3d] dark:text-white flex items-center gap-2 tracking-wide uppercase font-mono">
                <ShieldAlert size={15} className="text-blue-600 dark:text-cyan-400" />
                Recent Verified Findings Intel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Vulnerability evidence payloads & audit traces</p>
            </div>
            <Link
              to="/findings"
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition"
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
                  className="group rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060a14] transition duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                >
                  <Link to={`/findings/${f._id}`} className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 rounded-md border border-blue-100 dark:border-slate-700 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
                        {f.findingId}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#0f1f3d] dark:text-white text-xs truncate group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">
                          {f.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Target Route: <code className="text-slate-600 dark:text-slate-300 font-mono">{f.route || f.endpoint || '/api/v1/resource'}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={f.severity} />
                      <StatusBadge status={f.status} />
                      <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition">
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
        <h2 className="text-sm font-bold text-[#0f1f3d] dark:text-white flex items-center gap-2 tracking-wide uppercase font-mono">
          <BarChart2 size={15} className="text-blue-600 dark:text-cyan-400" />
          Severity Distribution
        </h2>
        <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">
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
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mt-0.5">
                      {activeItem.name} ({activeItem.pct}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold tracking-tight text-[#0f1f3d] dark:text-white">{activeTotal}</span>
                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">TOTAL CASES</span>
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
                        ? 'border-blue-300 bg-blue-50 shadow-sm dark:border-slate-600 dark:bg-slate-800/90'
                        : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060a14] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
                        {slaMap[item.name]}
                      </span>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <div className="text-right shrink-0 min-w-[45px]">
                        <span className="font-mono text-xs font-bold text-[#0f1f3d] dark:text-white">{val}</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-1">({pct}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enterprise Risk Posture Strip */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-3 text-center">
            <div className="rounded border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#060a14] p-1.5">
              <span className="block text-[9px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">HIGHEST SEVERITY</span>
              <span className="block font-mono text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                {sev.Critical > 0 ? 'CRITICAL' : sev.High > 0 ? 'HIGH' : 'MEDIUM'}
              </span>
            </div>
            <div className="rounded border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#060a14] p-1.5">
              <span className="block text-[9px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">SLA COMPLIANCE</span>
              <span className="block font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">100% ON TIME</span>
            </div>
            <div className="rounded border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#060a14] p-1.5">
              <span className="block text-[9px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">REMEDIATION STATUS</span>
              <span className="block font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 mt-0.5">ACTIVE MONITORING</span>
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090f1f] p-3.5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        {badge && (
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-[#0f1f3d] dark:text-white">{value}</span>
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
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700/80 ${className}`}>
      {children}
    </div>
  );
}
