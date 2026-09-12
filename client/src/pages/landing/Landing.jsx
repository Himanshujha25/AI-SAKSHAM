import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Radar, Bug, BrainCircuit, Gauge, FileText,
  ArrowRight, Play, Moon, Sun, Check, Sparkles, Lock, TrendingUp,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const features = [
  { icon: Radar, title: 'Attack Surface Discovery', desc: 'Routes, APIs, JS, tech, headers and deps organized into a visual map — not a raw dump.' },
  { icon: Bug, title: 'Findings with Evidence', desc: 'Every VUL-001… carries endpoint, evidence and verification status. Scanner signal ≠ verified finding.' },
  { icon: Check, title: 'Verification Workflow', desc: 'Potential → Under Review → Verified / False Positive with confidence, reviewer and notes.' },
  { icon: BrainCircuit, title: 'AI Security Analyst', desc: 'Structured finding → classification, impact, dev-friendly fix and priority reason. Assistance, not truth.' },
  { icon: Gauge, title: 'CVSS Risk Scoring', desc: '0–10 scores mapped to Critical/High/Medium/Low with security score 0–100 for the whole project.' },
  { icon: FileText, title: 'Professional Reports', desc: 'Executive / Technical / Summary PDFs with scope, severity charts, evidence and remediation.' },
];

const steps = ['Project', 'Authorized Target', 'Assessment', 'Attack Surface', 'Findings + Evidence', 'Verification', 'AI Analysis', 'CVSS + Remediation', 'Report'];

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sentinelai_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="rounded-lg border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-2 backdrop-blur transition duration-200 hover:scale-110 hover:border-white/[0.2] hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.3)]"
      title="Toggle theme"
    >
      {dark ? <Sun size={16} className="text-amber-300" /> : <Moon size={16} className="text-slate-700" />}
    </button>
  );
}

function LandingHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-gradient-to-r from-[#04060d]/80 to-[#0a0f1e]/80 backdrop-blur-2xl shadow-lg shadow-black/20">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-bold transition group-hover:scale-110 shadow-[0_0_24px_-6px_rgba(34,211,238,0.8)]">
            <ShieldCheck size={18} />
          </span>
          <span className="truncate font-semibold tracking-tight text-white">SentinelAI</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {['Features', 'Stats', 'Workflow'].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="relative transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)]">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white hover:bg-white/[0.08] border border-white/[0.12] sm:block">
                Sign in
              </Link>
              <Link to="/auth/register" className="group rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)]">
                Get started <ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { user, loading } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      try {
        // Only fetch stats if user is authenticated
        if (!user) return null;
        return (await api.get('/dashboard/overview')).data;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
    enabled: !!user, // Only run query if user exists
  });

  return (
    <section className="relative w-full overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cyan-600/[0.15] via-blue-600/[0.08] to-transparent" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-blue-600/[0.08] blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-3xl" />
      </div>
      
      <div className="relative z-10 mx-auto grid w-full max-w-6xl min-w-0 gap-10 px-4 pb-16 pt-14 md:grid-cols-2 md:px-6 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-gradient-to-r from-white/[0.08] to-white/[0.03] backdrop-blur px-3 py-1.5 text-xs font-medium text-slate-300">
            <Sparkles size={12} className="text-cyan-400" /> AI-powered security assessment
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Turn security assessments into <span className="text-glow-cyan text-cyan-300">actionable reports</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Discover attack surface, verify findings with evidence, prioritize risk with CVSS, and generate remediation reports — all in one platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth/register" className="group rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_-6px_rgba(34,211,238,0.8)]">
              Start assessment <ArrowRight size={15} className="ml-1 inline transition group-hover:translate-x-1" />
            </Link>
            <Link to="/auth/login" className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur px-5 py-3 text-sm font-medium text-slate-300 transition hover:-translate-y-0.5 hover:border-white/[0.2] hover:text-white">
              <Play size={15} /> Live demo
            </Link>
          </div>
          
          {/* Live Stats */}
          <div className="mt-10 grid max-w-sm grid-cols-3 gap-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur p-4 text-center">
              <p className="text-2xl font-bold text-cyan-300">{isLoading ? '—' : (data?.securityScore ?? 0)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Avg Score</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur p-4 text-center">
              <p className="text-2xl font-bold text-cyan-300">{isLoading ? '—' : (data?.totalFindings ?? 0)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Findings</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur p-4 text-center">
              <p className="text-2xl font-bold text-cyan-300">{isLoading ? '—' : (data?.recentAssessments?.length ?? 0)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Assessments</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative min-w-0">
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-white">Live Dashboard</p>
              <span className="rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                <span className="live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" /> ACTIVE
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Security Score</p>
                    <p className="mt-2 text-3xl font-bold text-white">{isLoading ? '—' : `${data?.securityScore ?? 0}/100`}</p>
                  </div>
                  <TrendingUp className="text-cyan-400" size={32} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                  <p className="text-sm text-slate-400">Critical</p>
                  <p className="mt-1 text-xl font-bold text-red-400">{isLoading ? '—' : (data?.severity?.Critical ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                  <p className="text-sm text-slate-400">High</p>
                  <p className="mt-1 text-xl font-bold text-orange-400">{isLoading ? '—' : (data?.severity?.High ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                  <p className="text-sm text-slate-400">Medium</p>
                  <p className="mt-1 text-xl font-bold text-amber-400">{isLoading ? '—' : (data?.severity?.Medium ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                  <p className="text-sm text-slate-400">Low</p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">{isLoading ? '—' : (data?.severity?.Low ?? 0)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
              <Lock size={12} className="text-emerald-400" /> Only authorized targets assessed
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Complete assessment workflow</h2>
        <p className="mt-3 max-w-2xl text-slate-300">From attack surface discovery to verified findings to professional reports — all in one platform.</p>
      </motion.div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div key={f.title} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.15]">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/10 ring-1 ring-cyan-400/30 transition group-hover:scale-110">
              <f.icon size={20} className="text-cyan-300" />
            </span>
            <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="relative z-10 w-full border-t border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent py-16 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Nine-step security pipeline</h2>
          <p className="mt-3 text-slate-300">A consistent workflow from project setup through to verified findings and reporting.</p>
        </motion.div>
        <div className="mt-10 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <motion.span key={s} 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="cursor-default rounded-lg border border-white/[0.08] bg-gradient-to-r from-white/[0.05] to-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:-translate-y-0.5 hover:border-white/[0.15]">
              <span className="mr-2 font-mono text-xs text-slate-500">{i + 1}</span>{s}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemo() {
  return (
    <section id="stats" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Real-time platform stats</h2>
        <p className="mt-3 text-slate-300">Live data from active assessments and verified findings.</p>
      </motion.div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ['Project Coverage', 'Authorized targets tracked with real-time assessment progress and findings across all security domains.', ShieldCheck],
          ['Verified Findings', 'Every finding goes through verification workflow. Evidence stored, confidence scored, reviewer annotated.', Check],
          ['Risk Scoring', 'CVSS-based scoring with automated classification. Security score reflects project-wide posture.', TrendingUp],
        ].map(([t, d, Icon], i) => (
          <motion.div key={t} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/[0.15]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 ring-1 ring-cyan-400/30">
              <Icon size={20} className="text-cyan-300" />
            </div>
            <p className="mt-4 font-semibold text-white">{t}</p>
            <p className="mt-2 text-sm text-slate-400">{d}</p>
            <Link to="/auth/login" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition hover:text-cyan-200 hover:gap-2">
              Explore <ArrowRight size={14} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} 
        className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] p-8 backdrop-blur-xl md:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white md:text-4xl">Ready to secure your applications?</h2>
          <p className="mt-4 max-w-lg text-slate-300">Start with authorized assessments, turn findings into verified risks, and generate reports your team trusts.</p>
          <div className="relative mt-8 flex flex-wrap gap-4">
            <Link to="/auth/register" className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 font-medium text-slate-950 transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_-6px_rgba(34,211,238,0.8)]">
              Get started
            </Link>
            <Link to="/auth/login" className="rounded-lg border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur px-6 py-3 font-medium text-slate-300 transition hover:-translate-y-0.5 hover:border-white/[0.2] hover:text-white">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur">
      <div className="grid w-full min-w-0 gap-8 px-4 py-12 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950">
              <ShieldCheck size={16} />
            </span>
            SentinelAI
          </div>
          <p className="mt-3 text-sm text-slate-400">AI-powered security assessment and vulnerability management platform.</p>
        </div>
        {[
          ['Platform', ['Features', 'Workflow', 'Stats', 'Security']],
          ['Product', ['Dashboard', 'Projects', 'Reports', 'Settings']],
          ['Support', ['Documentation', 'API Docs', 'Contact', 'Status']],
        ].map(([h, items]) => (
          <div key={h}>
            <p className="text-sm font-semibold text-white">{h}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              {items.map((x) => <li key={x}><a href="#" className="transition hover:text-cyan-300">{x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.08]">
        <p className="w-full px-4 py-4 text-xs text-slate-500 md:px-6">
          © 2024 SentinelAI. Authorized testing only. <a href="#" className="hover:text-cyan-300 transition">Privacy Policy</a> · <a href="#" className="hover:text-cyan-300 transition">Terms of Service</a>
        </p>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#04060d] text-slate-100">
      {/* Ambient gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cyan-600/[0.15] via-blue-600/[0.08] to-transparent" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-blue-600/[0.08] blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-3xl" />
      </div>
      <LandingHeader />
      <Hero />
      <Features />
      <Workflow />
      <LiveDemo />
      <CTA />
      <LandingFooter />
    </div>
  );
}
