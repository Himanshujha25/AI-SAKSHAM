import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Radar, Bug, BrainCircuit, Gauge, FileText,
  ArrowRight, Play, Moon, Sun, Check, Sparkles, Lock,
} from 'lucide-react';
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
      className="rounded-lg border border-slate-200 bg-white/60 p-2 text-slate-600 backdrop-blur transition hover:scale-105 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800"
      title="Toggle theme"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function LandingHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition group-hover:scale-105 dark:bg-white dark:text-slate-900">
            <ShieldCheck size={18} />
          </span>
          <span className="truncate font-semibold tracking-tight">SentinelAI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 dark:text-slate-300 md:flex">
          {['Features', 'Workflow', 'Live Demo', 'Reports'].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="relative transition hover:text-slate-900 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-slate-900 after:transition-all hover:after:w-full dark:hover:text-white dark:after:bg-white">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 dark:bg-white dark:text-slate-900">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="hidden rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-slate-100 sm:block dark:hover:bg-slate-800">Sign in</Link>
              <Link to="/auth/register" className="group rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 dark:bg-white dark:text-slate-900">
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
  return (
    <section className="relative w-full overflow-x-clip">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-full max-w-[42rem] -translate-x-1/2 rounded-full bg-slate-300/40 blur-3xl dark:bg-slate-700/30" />
      <div className="pointer-events-none absolute top-40 left-0 h-72 w-72 -translate-x-1/3 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-900/25" />
      <div className="mx-auto grid w-full max-w-6xl min-w-0 gap-10 px-4 pb-16 pt-14 md:grid-cols-2 md:px-6 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
            <Sparkles size={12} /> AI-assisted security assessment platform
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Security assessment, <span className="text-emerald-700 dark:text-emerald-300">from target to report.</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-300">
            SentinelAI discovers the attack surface, verifies findings with evidence, prioritizes risk with CVSS and generates remediation-ready reports — in one dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/auth/register" className="group rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-white dark:text-slate-900">
              Start assessment <ArrowRight size={15} className="ml-1 inline transition group-hover:translate-x-1" />
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg dark:border-slate-700 dark:hover:bg-slate-900">
              <Play size={15} /> Live demo
            </Link>
          </div>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
            {[['72/100', 'Demo score'], ['VUL-001…', 'Tracked findings'], ['PDF', 'Pro reports']].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-slate-200 bg-white/70 p-3 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70">
                <p className="font-semibold">{v}</p><p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-2xl backdrop-blur transition hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">Demo Assessment</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">VERIFIED</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="break-words font-mono text-xs text-slate-500">VUL-001 · Broken Access Control · CVSS 8.1 HIGH</p>
              <p className="mt-1 break-words text-sm">Controlled test returned out-of-scope data on <code className="break-all rounded bg-slate-200/70 px-1 dark:bg-slate-700">/api/reports/{'{id}'}</code></p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-200 p-2.5 transition hover:border-emerald-400 hover:shadow dark:border-slate-700"><p className="font-semibold">AI Analysis · 94%</p><p className="text-slate-500">Server-side ownership check required.</p></div>
              <div className="rounded-lg border border-slate-200 p-2.5 transition hover:border-emerald-400 hover:shadow dark:border-slate-700"><p className="font-semibold">Remediation · OPEN</p><p className="text-slate-500">Validate authorization before return.</p></div>
            </div>
          </div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="mt-3 inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <Lock size={13} className="text-emerald-500" /> Only authorized targets assessed
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
      <motion.div {...fadeUp}>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Everything between scan and sign-off</h2>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-300">Not a vulnerability dump — a complete workflow with evidence, verification and fixes.</p>
      </motion.div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1.5 hover:border-slate-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition group-hover:scale-110 group-hover:bg-emerald-100 dark:bg-slate-800 dark:group-hover:bg-emerald-950">
              <f.icon size={18} className="transition group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
            </span>
            <h3 className="mt-3 font-medium">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="border-y border-slate-200/70 bg-white/60 py-14 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">One pipeline, nine steps</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Hover any stage — the whole flow stays consistent across pages.</p>
        </motion.div>
        <div className="mt-8 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <motion.span key={s} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.04 }}
              className="cursor-default rounded-full border border-slate-200 bg-white px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-slate-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500">
              <span className="mr-2 font-mono text-xs text-slate-400">{i + 1}</span>{s}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemo() {
  return (
    <section id="live-demo" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
      <motion.div {...fadeUp}>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">See the demo story</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Score 72/100 → open VUL-001 → verify → AI fix → export PDF.</p>
      </motion.div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ['1 · Discover', '42 endpoints mapped — 18 public, 20 authenticated, 4 admin — with method + auth table.'],
          ['2 · Verify', 'Scanner signal separated from verified finding. Confidence 94%, reviewer + evidence stored.'],
          ['3 · Report', 'Executive summary, severity chart, per-finding evidence, CVSS and remediation in one PDF.'],
        ].map(([t, d], i) => (
          <motion.div key={t} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <p className="font-medium">{t}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</p>
            <Link to="/dashboard" className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 hover:gap-2">Open live app <ArrowRight size={14} /></Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="reports" className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
      <motion.div {...fadeUp} className="relative w-full overflow-hidden rounded-3xl bg-slate-900 p-8 text-white transition hover:shadow-2xl dark:bg-white dark:text-slate-900 md:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 max-w-full rounded-full bg-emerald-500/20 blur-3xl" />
        <h2 className="max-w-lg text-2xl font-semibold tracking-tight md:text-3xl">Turn authorized assessments into reports judges trust.</h2>
        <p className="mt-2 max-w-md text-sm opacity-80">Projects, targets, live progress, findings, AI analysis and PDF export — wired to a real API + MongoDB.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/auth/register" className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900 dark:text-white">Create analyst account</Link>
          <Link to="/auth/login" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-white/10 dark:border-slate-900/20 dark:hover:bg-slate-900/5">Sign in</Link>
        </div>
      </motion.div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="grid w-full min-w-0 gap-8 px-4 py-10 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-semibold"><ShieldCheck size={17} /> SentinelAI</p>
          <p className="mt-2 text-sm text-slate-500">AI-assisted security assessment and vulnerability management platform.</p>
        </div>
        {[
          ['Product', ['Features', 'Workflow', 'Live Demo', 'Reports']],
          ['Workspace', ['Dashboard', 'Projects', 'Assessments', 'Findings']],
          ['Account', ['Sign in', 'Register', 'Settings', 'API Docs']],
        ].map(([h, items]) => (
          <div key={h}>
            <p className="text-sm font-semibold">{h}</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-slate-500">
              {items.map((x) => <li key={x}><a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-slate-900 hover:underline dark:hover:text-white">{x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <p className="w-full px-4 py-4 text-xs text-slate-500 md:px-8">Authorized testing only · Tailwind components, no bulky CSS · Light + dark supported</p>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
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
