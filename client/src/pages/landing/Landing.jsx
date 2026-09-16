import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Radar, Bug, Gauge, FileText,
  ArrowRight, Check, Lock, Fingerprint, KeyRound, Terminal,
  Play, Pause, Volume2, Maximize2, Search, ShieldAlert, CheckCircle2, Cpu, Code2, RotateCcw, TrendingUp, ChevronRight, Monitor
} from 'lucide-react';
import { useAuth } from '../../store/auth';
import { SakshamLogo } from '../../components/shared/SakshamLogo';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const features = [
  { code: 'MOD.01', icon: Radar, title: 'Attack Surface Discovery', desc: 'Routes, APIs, JS, tech, headers and deps organized into a visual map — not a raw dump.' },
  { code: 'MOD.02', icon: Bug, title: 'Findings with Evidence', desc: 'Every VUL-001… carries endpoint, evidence and verification status. Scanner signal ≠ verified finding.' },
  { code: 'MOD.03', icon: Check, title: 'Verification Workflow', desc: 'Potential → Under Review → Verified / False Positive with confidence, reviewer and notes.' },
  { code: 'MOD.04', icon: Code2, title: 'Automated Security Analysis', desc: 'Structured finding → classification, impact, dev-friendly fix and priority reason.' },
  { code: 'MOD.05', icon: Gauge, title: 'CVSS Risk Scoring', desc: '0–10 scores mapped to Critical/High/Medium/Low with a security score for the whole project.' },
  { code: 'MOD.06', icon: FileText, title: 'Professional Reports', desc: 'Executive / Technical / Summary PDFs with scope, severity charts, evidence and remediation.' },
];

const steps = ['Project', 'Authorized Target', 'Assessment', 'Attack Surface', 'Findings + Evidence', 'Verification', 'Automated Analysis', 'CVSS + Remediation', 'Report'];

function CyberChrome() {
  return (
    <style>{`
      @keyframes scan-sweep {
        0% { transform: translateY(-100%); opacity: 0; }
        12% { opacity: .6; }
        88% { opacity: .6; }
        100% { transform: translateY(700%); opacity: 0; }
      }
      @keyframes cursor-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      .hud-grid {
        background-image:
          linear-gradient(rgba(34, 211, 238, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 211, 238, 0.04) 1px, transparent 1px);
        background-size: 48px 48px;
        -webkit-mask-image: radial-gradient(ellipse 85% 60% at 50% 0%, black 40%, transparent 100%);
        mask-image: radial-gradient(ellipse 85% 60% at 50% 0%, black 40%, transparent 100%);
      }
      .scan-sweep { animation: scan-sweep 5s ease-in-out infinite; }
      .cursor-blink { animation: cursor-blink 1s step-start infinite; }
    `}</style>
  );
}

function LandingHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl shadow-lg shadow-slate-900/5 dark:border-transparent dark:bg-gradient-to-r dark:from-[#04060d]/90 dark:via-[#070b16]/90 dark:to-[#04060d]/90 dark:shadow-xl dark:shadow-black/40">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-3 transition-transform hover:opacity-95">
          <SakshamLogo size="md" variant="full" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          {['Demo-Video', 'Analyzer', 'Features', 'Workflow'].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="relative transition hover:text-slate-900 dark:hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full">
              {l === 'Demo-Video' ? 'Live Video' : l}
            </a>
          ))}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_8px_24px_rgba(15,31,61,0.08)] transition hover:bg-white/90 dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.12] dark:hover:border-white/20">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="flex items-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_8px_24px_rgba(15,31,61,0.08)] transition hover:bg-white/90 dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.12] dark:hover:border-white/20">
                <KeyRound size={14} /> Sign in
              </Link>
              <Link to="/auth/register" className="group rounded-xl bg-blue-600/80 backdrop-blur-xl border border-white/40 px-4 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-blue-600/90 dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35">
                Request access <ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Mock Interactive Video Player Component
function MockVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeScene, setActiveScene] = useState(0);

  const scenes = [
    {
      title: 'Target Setup & Scope Check',
      duration: '0:45',
      log: 'Initializing assessment scope for World Monitor target URL...',
      code: 'POST /api/v1/targets/register -> HTTP 200 OK (Authorization Checked)'
    },
    {
      title: 'Attack Surface Crawling',
      duration: '1:15',
      log: 'Discovered 42 endpoints, 18 public routes, 4 admin interfaces...',
      code: 'CRAWLER: Found /api/v1/reports/:id (Requires Owner Validation)'
    },
    {
      title: 'Verification Engine PoC',
      duration: '2:10',
      log: 'Executing controlled IDOR test with non-owner User B credentials...',
      code: 'STATUS: VERIFIED (Confidence: 96%) -> Exposing Proof-of-Concept Evidence Payload'
    },
    {
      title: 'AI Remediation & PDF Export',
      duration: '3:05',
      log: 'Gemini AI generating developer code fix & executive PDF report...',
      code: 'GENERATE REPORT -> World_Monitor_Security_Assessment_2026.pdf (Downloaded)'
    }
  ];

  return (
    <section id="demo-video" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <motion.div {...fadeUp} className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-cyan-300 ring-1 ring-cyan-400/20">
          <Monitor size={13} className="text-blue-600 dark:text-cyan-400" /> Saksham AI Platform Demonstration
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white md:text-4xl">
          Watch <span className="text-blue-600 dark:text-cyan-300">Saksham AI in Action</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300 text-sm md:text-base">
          Interactive video simulation demonstrating the end-to-end security assessment lifecycle of the World Monitor application.
        </p>
      </motion.div>

      {/* Video Container Frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-8 overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#0a0f1e]/95 dark:via-[#070b16] dark:to-[#04060d] border border-slate-200 dark:border-transparent shadow-xl backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/10"
      >
        {/* Video Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-slate-500 dark:text-slate-400">SakshamAI_Platform_Walkthrough.mp4</span>
          </div>
          <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[11px] text-blue-600 dark:text-cyan-300">HD 1080p</span>
        </div>

        {/* Video Screen Viewport */}
        <div className="relative aspect-video w-full overflow-hidden bg-black/80 flex flex-col justify-between p-6">
          <div className="hud-grid absolute inset-0 pointer-events-none opacity-40" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="rounded-xl bg-black/60 p-3 backdrop-blur border border-white/10 max-w-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Scene {activeScene + 1} of 4:</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{scenes[activeScene].title}</h4>
              <p className="mt-1 font-mono text-xs text-slate-300">{scenes[activeScene].log}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/30">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" /> REC · LIVE DEMO
            </div>
          </div>

          {!isPlaying && (
            <button
              onClick={() => setIsPlaying(true)}
              className="group absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:bg-white/[0.12] hover:border-white/20 z-20"
            >
              <Play size={32} className="ml-1 fill-current" />
            </button>
          )}

          <div className="relative z-10 rounded-xl bg-black/70 p-3 font-mono text-xs text-emerald-400 border border-white/5">
            <code>&gt; {scenes[activeScene].code}</code>
          </div>
        </div>

        {/* Video Scrubber & Control Bar */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/60">
          <div className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 cursor-pointer overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              animate={{ width: isPlaying ? '100%' : `${((activeScene + 1) / 4) * 100}%` }}
              transition={{ duration: isPlaying ? 8 : 0.5 }}
              onAnimationComplete={() => {
                if (isPlaying) {
                  setActiveScene((prev) => (prev + 1) % 4);
                }
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:bg-white/90 dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.12] dark:hover:border-white/20"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-current" />}
                {isPlaying ? 'Pause' : 'Play Video'}
              </button>
              <span className="font-mono text-slate-500 dark:text-slate-400">01:42 / 03:15</span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {scenes.map((sc, idx) => (
                <button
                  key={sc.title}
                  onClick={() => {
                    setActiveScene(idx);
                    setIsPlaying(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeScene === idx ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-cyan-400/20 dark:text-cyan-300 dark:ring-cyan-400/40' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {idx + 1}. {sc.title.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Volume2 size={16} />
              <Maximize2 size={16} />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// Interactive Live Assessment Simulator for Landing Page
function InteractiveAnalyzer() {
  const [appName, setAppName] = useState('World Monitor');
  const [targetUrl, setTargetUrl] = useState('http://world-monitor-demo.local');
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const runSimulatedScan = () => {
    if (scanning) return;
    setScanning(true);
    setPhase('DISCOVERY');
    setProgress(15);
    setActiveTab('OVERVIEW');

    setTimeout(() => {
      setPhase('ASSESSMENT');
      setProgress(45);
    }, 1200);

    setTimeout(() => {
      setPhase('VERIFICATION');
      setProgress(75);
    }, 2400);

    setTimeout(() => {
      setPhase('COMPLETED');
      setProgress(100);
      setScanning(false);
    }, 3600);
  };

  const resetScan = () => {
    setPhase('IDLE');
    setProgress(0);
    setScanning(false);
  };

  return (
    <section id="analyzer" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <motion.div {...fadeUp} className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-cyan-300 ring-1 ring-cyan-400/20">
          <ShieldCheck size={13} className="text-blue-600 dark:text-cyan-400" /> Interactive Assessment Simulator
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white md:text-4xl">
          Experience the <span className="text-blue-600 dark:text-cyan-300">Live Security Pipeline</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300 text-sm md:text-base">
          Type an application target name & URL below to simulate an automated security assessment from attack surface map to verified finding.
        </p>
      </motion.div>

      {/* Simulator Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-8 overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#0a0f1e]/90 dark:via-[#070b16]/95 dark:to-[#04060d]/90 border border-slate-200 dark:border-transparent p-6 md:p-8 shadow-xl backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
        
        {/* Input Bar */}
        <div className="grid gap-4 md:grid-cols-12 md:items-center">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Target App Name</label>
            <div className="relative">
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={scanning}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-60 dark:bg-black/40 dark:border-transparent dark:text-white"
                placeholder="World Monitor"
              />
            </div>
          </div>
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Target Application URL</label>
            <div className="relative">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                disabled={scanning}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 font-mono text-sm text-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-60 dark:bg-black/40 dark:border-transparent dark:text-cyan-300"
                placeholder="http://target-app.local"
              />
            </div>
          </div>
          <div className="md:col-span-3 md:mt-5">
            {phase === 'COMPLETED' ? (
              <button
                onClick={resetScan}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 backdrop-blur-xl border border-slate-200 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/15"
              >
                <RotateCcw size={15} /> Reset Simulator
              </button>
            ) : (
              <button
                onClick={runSimulatedScan}
                disabled={scanning}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600/80 backdrop-blur-xl border border-white/40 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35"
              >
                {scanning ? <Cpu size={16} className="animate-spin" /> : <Play size={16} className="fill-current" />}
                {scanning ? 'Analyzing Target...' : 'Analyze Target'}
              </button>
            )}
          </div>
        </div>

        {/* Scan Status & Pipeline Step Indicators */}
        <div className="mt-6 border-t border-slate-200 dark:border-white/5 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${scanning ? 'bg-cyan-400 animate-ping' : phase === 'COMPLETED' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Status: {phase === 'IDLE' ? 'Ready for Analysis' : phase === 'COMPLETED' ? 'Assessment Completed' : `Pipeline Stage: ${phase}`}
              </span>
            </div>
            <span className="font-mono text-blue-600 dark:text-cyan-300">{progress}% Completed</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-black/50">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Results Workspace */}
        <div className="mt-6 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-transparent p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-3">
            {[
              { id: 'OVERVIEW', label: '1. Target Overview', icon: Radar },
              { id: 'FINDINGS', label: '2. Security Findings', icon: Bug },
              { id: 'EVIDENCE', label: '3. Proof Evidence', icon: Terminal },
              { id: 'AI_FIX', label: '4. Code Remediation', icon: Code2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition backdrop-blur-xl border ${
                  activeTab === tab.id
                    ? 'bg-white border-slate-200 text-[#0f1f3d] shadow-sm dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeTab === 'OVERVIEW' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-transparent p-3 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security Score</p>
                      <p className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-cyan-300">{phase === 'COMPLETED' ? '72/100' : '—'}</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-transparent p-3 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Endpoints Discovered</p>
                      <p className="mt-1 text-2xl font-extrabold text-[#0f1f3d] dark:text-white">{phase === 'IDLE' ? '0' : '42'}</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-transparent p-3 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical / High</p>
                      <p className="mt-1 text-2xl font-extrabold text-red-600 dark:text-red-400">{phase === 'COMPLETED' ? '1 Critical, 3 High' : '—'}</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-transparent p-3 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verification Rate</p>
                      <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{phase === 'COMPLETED' ? '96% Confirmed' : '—'}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-transparent p-4 text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p className="text-slate-500 dark:text-slate-400">// Discovered Target Attack Surface ({appName}):</p>
                    <p className="mt-1 text-blue-600 dark:text-cyan-300">➜ POST {targetUrl}/api/v1/auth/login <span className="text-slate-500">(Authentication API)</span></p>
                    <p className="text-blue-600 dark:text-cyan-300">➜ GET {targetUrl}/api/v1/profile <span className="text-slate-500">(Authenticated Route)</span></p>
                    <p className="text-amber-700 dark:text-amber-300">➜ GET {targetUrl}/api/v1/reports/:id <span className="text-red-600 dark:text-red-400 font-bold">[VULNERABLE - IDOR Check Triggered]</span></p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'FINDINGS' && (
                <motion.div key="findings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-transparent p-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">VUL-001</span>
                        <h4 className="font-bold text-[#0f1f3d] dark:text-white text-sm">Broken Access Control (IDOR)</h4>
                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">HIGH · CVSS 8.1</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Affected Route: <code className="text-blue-600 dark:text-cyan-300">/api/v1/reports/:id</code></p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 size={13} /> VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-transparent p-3.5 opacity-80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">VUL-002</span>
                        <h4 className="font-semibold text-[#0f1f3d] dark:text-white text-sm">Missing Security Header (Content-Security-Policy)</h4>
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">MEDIUM · CVSS 5.3</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Affected Route: <code className="text-blue-600 dark:text-cyan-300">/</code></p>
                    </div>
                    <span className="rounded bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">UNDER REVIEW</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'EVIDENCE' && (
                <motion.div key="evidence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 font-mono text-xs">
                  <div className="rounded-xl bg-black/60 p-4 leading-relaxed">
                    <p className="text-slate-500">// PROOF-OF-CONCEPT EVIDENCE PAYLOAD (VUL-001):</p>
                    <p className="text-cyan-300 mt-2">-- SENT TEST REQUEST (Session: User_B) --</p>
                    <p className="text-slate-300">GET {targetUrl}/api/v1/reports/rep_userA_9921 HTTP/1.1</p>
                    <p className="text-slate-300">Host: world-monitor-demo.local</p>
                    <p className="text-slate-300">Authorization: Bearer eyJhbGciOiJIUzI1Ni... (User B Token)</p>
                    
                    <p className="text-red-400 mt-3">-- RECEIVED RESPONSE (200 OK - Access Isolation Failed!) --</p>
                    <p className="text-slate-300">HTTP/1.1 200 OK</p>
                    <p className="text-emerald-300">{`{ "reportId": "rep_userA_9921", "owner": "User_A", "confidentialData": "Sensitivie Operations Report" }`}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'AI_FIX' && (
                <motion.div key="aifix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="rounded-xl bg-blue-50 dark:bg-cyan-950/20 border border-blue-200 dark:border-transparent p-4 ring-1 ring-blue-200 dark:ring-cyan-500/30">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
                      <Code2 size={15} /> Security Remediation Guidance
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="text-[#0f1f3d] dark:text-white">Impact Analysis:</strong> The backend endpoint does not validate resource ownership server-side. User B can access User A's private data simply by enumerating report IDs.
                    </p>
                    <p className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">Recommended Developer Fix Snippet:</p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-black/60 p-3 font-mono text-[11px] text-cyan-300 leading-relaxed">
{`// Express.js Controller Fix:
const report = await Report.findOne({ _id: req.params.id, ownerId: req.user.id });
if (!report) {
  return res.status(403).json({ error: "Access Denied: Resource ownership check failed" });
}`}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function AccessConsole() {
  const lines = [
    { text: 'operator@saksham:~$ authenticate --session', tone: 'command' },
    { text: 'Verifying operator credentials... ok', tone: 'output' },
    { text: 'Scope check: authorized target only', tone: 'output' },
    { text: 'Loading pipeline: discover → verify → score → report', tone: 'output' },
    { text: 'Access granted — session started', tone: 'success' },
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200 dark:border-transparent p-6 shadow-xl backdrop-blur-2xl">
      <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/10 to-transparent" />
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#0f1f3d] dark:text-white">
          <Terminal size={15} className="text-blue-600 dark:text-cyan-400" /> Session console
        </p>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> Authorized
        </span>
      </div>
      <div className="space-y-2 rounded-xl bg-black dark:bg-black/50 p-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <motion.p
            key={line.text}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.35, duration: 0.3 }}
            className={
              line.tone === 'command' ? 'text-slate-200' : line.tone === 'success' ? 'text-emerald-300' : 'text-slate-300'
            }
          >
            {line.text}
          </motion.p>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 + lines.length * 0.35 }}
          className="cursor-blink inline-block h-3.5 w-2 translate-y-0.5 bg-cyan-400"
        />
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-transparent px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400">
        <Lock size={13} className="text-emerald-600 dark:text-emerald-400" /> Assessments run only against explicitly authorized targets.
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative w-full overflow-x-clip">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl min-w-0 gap-10 px-4 pb-12 pt-14 md:grid-cols-2 md:px-6 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-cyan-300">
            <Fingerprint size={13} className="text-blue-600 dark:text-cyan-400" /> Saksham AI Security Platform
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-[#0f1f3d] dark:text-white md:text-5xl">
            Turn security audits into <span className="text-blue-600 dark:text-cyan-300">verified, evidence-backed</span> reports
          </h1>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            Map the attack surface, back every finding with raw PoC evidence, score risk with CVSS, and hand your team an actionable security report.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#demo-video" className="group rounded-xl bg-blue-600/80 backdrop-blur-xl border border-white/40 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-blue-600/90 flex items-center gap-2 dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35">
              <Play size={16} className="fill-current" /> See Live Demo <ArrowRight size={15} className="ml-1 inline transition group-hover:translate-x-1" />
            </a>
            <a href="#analyzer" className="flex items-center gap-2 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-[0_8px_24px_rgba(15,31,61,0.08)] transition hover:bg-white/90 dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-200 dark:shadow-none dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/15">
              Try Interactive Simulator
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative min-w-0">
          <AccessConsole />
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <motion.div {...fadeUp}>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white md:text-4xl">Complete Assessment Workflow</h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300 text-sm md:text-base">From attack surface discovery to verified findings to professional reports — all in one platform.</p>
      </motion.div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="group rounded-2xl bg-white dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200 dark:border-transparent p-6 shadow-sm backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 dark:hover:bg-white/[0.06]">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 text-blue-600 dark:text-cyan-300 transition group-hover:scale-105">
              <f.icon size={22} />
            </span>
            <p className="mt-4 font-mono text-[11px] text-blue-500 dark:text-cyan-400/60">{f.code}</p>
            <h3 className="mt-1 font-bold text-[#0f1f3d] dark:text-white text-base">{f.title}</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="relative z-10 w-full bg-gradient-to-b from-slate-900/[0.02] dark:from-white/[0.01] to-transparent py-16 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white md:text-4xl">Nine-Step Security Pipeline</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm md:text-base">A consistent workflow from project setup through to verified findings and reporting.</p>
        </motion.div>
        <div className="mt-10 flex flex-wrap gap-2.5">
          {steps.map((s, i) => (
            <motion.span key={s}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="cursor-default rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-[#0f1f3d] dark:bg-gradient-to-r dark:from-white/[0.04] dark:to-white/[0.02] dark:border-transparent dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white">
              <span className="mr-2 font-mono text-xs text-slate-500">{i + 1}</span>{s}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowDemo() {
  return (
    <section id="demo" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <motion.div {...fadeUp}>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white md:text-4xl">From Discovery to Verified Finding</h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300 text-sm md:text-base">A representative look at how a single finding moves through the pipeline.</p>
      </motion.div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200 dark:border-transparent p-6 shadow-sm backdrop-blur-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-blue-600 dark:text-cyan-300">
            <Radar size={20} />
          </div>
          <p className="mt-4 font-bold text-[#0f1f3d] dark:text-white">Attack Surface Mapped</p>
          <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-transparent p-3 font-mono text-[12px] text-slate-500 dark:text-slate-400">
            <p>/api/v2/auth <span className="text-blue-600 dark:text-cyan-400">POST</span></p>
            <p>/api/v2/users/:id <span className="text-blue-600 dark:text-cyan-400">GET</span></p>
            <p>react-router@6.21 <span className="text-slate-500">dependency</span></p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200 dark:border-transparent p-6 shadow-sm backdrop-blur-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-blue-600 dark:text-cyan-300">
            <Bug size={20} />
          </div>
          <p className="mt-4 font-bold text-[#0f1f3d] dark:text-white">Finding with Evidence</p>
          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-transparent p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-500">VUL-014</span>
              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[10px] text-orange-700 dark:text-orange-300">High · 7.4</span>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">Reflected XSS in search parameter</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
              <Check size={11} /> Verified
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200 dark:border-transparent p-6 shadow-sm backdrop-blur-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-blue-600 dark:text-cyan-300">
            <Code2 size={20} />
          </div>
          <p className="mt-4 font-bold text-[#0f1f3d] dark:text-white">Security Analysis Drafted</p>
          <p className="mt-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-transparent p-3 font-mono text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
            Classification: injection (CWE-79). Impact: session-token exposure. Fix: encode output and add a CSP. Priority: high.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <motion.div {...fadeUp}
        className="relative w-full overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-white/[0.06] dark:via-white/[0.03] dark:to-white/[0.01] border border-slate-200 dark:border-transparent p-8 shadow-xl backdrop-blur-2xl md:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-[#0f1f3d] dark:text-white md:text-4xl">Bring Your Team into Saksham AI</h2>
          <p className="mt-4 max-w-lg text-slate-600 dark:text-slate-300 text-sm md:text-base">Every assessment is scoped to an authorized target, every finding is verified, and every report is ready for stakeholders.</p>
          <div className="relative mt-8 flex flex-wrap gap-4">
            <Link to="/auth/register" className="rounded-xl bg-blue-600/80 backdrop-blur-xl border border-white/40 px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-blue-600/90 dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35">
              Request Access
            </Link>
            <Link to="/auth/login" className="rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-[0_8px_24px_rgba(15,31,61,0.08)] transition hover:bg-white/90 dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-200 dark:shadow-none dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/15">
              Operator Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-slate-200/60 bg-white/60 backdrop-blur dark:border-transparent dark:bg-gradient-to-b dark:from-white/[0.01] dark:to-transparent">
      <div className="grid w-full min-w-0 gap-8 px-4 py-12 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div>
          <SakshamLogo size="md" variant="full" />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">AI-Assisted Security Assessment & Vulnerability Management Platform.</p>
        </div>
        {[
          ['Platform', ['Demo-Video', 'Analyzer', 'Features', 'Workflow']],
          ['Product', ['Dashboard', 'Projects', 'Reports', 'Settings']],
          ['Support', ['Documentation', 'API Docs', 'Contact', 'Status']],
        ].map(([h, items]) => (
          <div key={h}>
            <p className="text-sm font-semibold text-[#0f1f3d] dark:text-white">{h}</p>
            <ul className="mt-3 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
              {items.map((x) => <li key={x}><a href={`#${x.toLowerCase()}`} className="transition hover:text-blue-600 dark:hover:text-cyan-300">{x === 'Demo-Video' ? 'Live Video' : x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 dark:border-white/5">
        <p className="w-full px-4 py-4 text-xs text-slate-500 md:px-6">
          © 2026 Saksham AI (SIH 2026 Problem 26163). Authorized assessments only.
        </p>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#eef3fb] dark:bg-[#04060d] text-slate-600 dark:text-slate-100 font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:bg-cyan-500/30 dark:selection:text-cyan-200">
      <CyberChrome />
      {/* Ambient Cyber Gradients & HUD Grid */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cyan-600/[0.12] via-blue-600/[0.06] to-transparent" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-blue-600/[0.06] blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-cyan-500/[0.05] blur-3xl" />
        <div className="hud-grid absolute inset-0" />
      </div>
      <LandingHeader />
      <Hero />
      <MockVideoPlayer />
      <InteractiveAnalyzer />
      <Features />
      <Workflow />
      <WorkflowDemo />
      <CTA />
      <LandingFooter />
    </div>
  );
}