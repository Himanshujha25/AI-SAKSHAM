import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  ShieldCheck,
  FolderKanban,
  FlaskConical,
  Bug,
  RotateCcw,
  FileText,
  ScrollText,
  BookOpen,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Activity as ActivityIcon,
  Crown,
  Eye,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { PageHeader, PremiumIcon } from '../../components/shared/shared';
import { Card, Button, Input } from '../../components/ui/primitives';
import { cn } from '../../lib/utils';

// Technical + Simple Dual Definition Tooltip Wrapper
export function TechTooltip({ term, tech, simple, children, className }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className={cn('relative inline-flex items-center cursor-help border-b border-dashed border-cyan-400/60 pb-0.5', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children || term}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 shadow-2xl text-left pointer-events-none transition duration-150 animate-in fade-in">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-1 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" /> Technical & Simple Explanation
          </span>
          <span className="block text-xs font-semibold text-[#0f1f3d] dark:text-white mb-1">
            <span className="text-blue-600 dark:text-cyan-300 font-mono">Technical: </span>{tech}
          </span>
          <span className="block text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-1 mt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Simple: </span>{simple}
          </span>
        </span>
      )}
    </span>
  );
}

// Dictionary of Technical & Simple terms
const GLOSSARY_ITEMS = [
  {
    term: 'Security Score',
    tech: 'Weighted 0-100 percentage metric derived from open findings, severity distribution, and verified fix rates.',
    simple: 'Your overall app health grade (Higher score means your app is safer and has fewer bugs).',
    category: 'Metrics',
  },
  {
    term: 'CVSS Score (CVSS v3.1)',
    tech: 'Common Vulnerability Scoring System providing a standardized 0.0–10.0 numerical severity rating based on exploitability & impact.',
    simple: 'A rating from 0 to 10 showing how dangerous a security flaw is (e.g. 9.0+ = Critical, 5.4 = Medium).',
    category: 'Metrics',
  },
  {
    term: 'CWE (Common Weakness Enumeration)',
    tech: 'Category dictionary for software security weaknesses (e.g. CWE-693 for Missing Security Headers, CWE-862 for IDOR).',
    simple: 'The official catalog ID number for a specific type of code bug.',
    category: 'Standards',
  },
  {
    term: 'OWASP Top 10',
    tech: 'Standard security awareness benchmark categorizing the 10 most critical web application security risks (e.g., A05:2021 Security Misconfiguration).',
    simple: 'The top 10 most common ways hackers break into websites.',
    category: 'Standards',
  },
  {
    term: 'Activity Stream & Audit Log',
    tech: 'Real-time timeline capturing security events, scan completions, status changes, and retest execution results.',
    simple: 'A live activity history feed showing every security test and result over time.',
    category: 'Features',
  },
  {
    term: 'PoC (Proof of Concept) cURL',
    tech: 'Command-line cURL request snippet configured with exact headers and endpoints to reliably reproduce a vulnerability.',
    simple: 'A 1-click test command to prove that the security bug actually exists.',
    category: 'Testing',
  },
  {
    term: 'Retest Status (PASSED / FAILED)',
    tech: 'Validation state outcome recorded after re-evaluating target endpoint after remediation code deployment.',
    simple: 'Shows whether your code fix successfully stopped the attack (PASSED) or if the bug is still present (FAILED).',
    category: 'Testing',
  },
  {
    term: 'Content-Security-Policy (CSP)',
    tech: 'HTTP header restricting external scripts, objects, and framing to mitigate Cross-Site Scripting (XSS) and injection.',
    simple: 'A security rule header that blocks untrusted scripts and hackers from injecting malware into your webpage.',
    category: 'Security Controls',
  },
  {
    term: 'User Roles & RBAC (Admin, Analyst, Viewer)',
    tech: 'Three-tier cryptographic JWT authorization policy partitioning administrative authority, active probing execution, and read-only inspection.',
    simple: 'Defines permissions: Admin manages everything, Analyst launches scans & verifies bugs, and Viewer reads reports and code fixes.',
    category: 'Access Control',
  },
  {
    term: 'Viewer Access & Scan Cost Governance',
    tech: 'Economical access-control tier disabling automated scanner worker queue dispatches and LLM token expenditures for read-only stakeholders.',
    simple: 'Junior devs and auditors get Viewer access so they can see fix guides and reports without launching expensive AI scans that cost company budget.',
    category: 'Access Control',
  },
];

export function Help() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [modalStep, setModalStep] = useState(null);

  const filteredGlossary = GLOSSARY_ITEMS.filter(
    (item) =>
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.tech.toLowerCase().includes(search.toLowerCase()) ||
      item.simple.toLowerCase().includes(search.toLowerCase())
  );

  const stepDetails = {
    1: {
      step: 1,
      title: 'Target Registration',
      subtitle: 'Step 1: Register Target API / Web Service',
      desc: 'Learn how to add target project endpoints, select HTTP methods, and provide JSON payloads.',
      icon: FolderKanban,
      color: 'text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-cyan-500/40 bg-blue-50 dark:bg-cyan-500/10',
      navTo: '/projects',
      navText: 'Go to Projects Workspace',
      content: (
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            In the <strong className="text-[#0f1f3d] dark:text-white font-mono">Projects</strong> page, you register the target server endpoint you want to test.
          </p>
          <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-blue-600 dark:text-cyan-300">HTTP Method Selection:</strong> Choose between <code className="text-blue-600 dark:text-cyan-400 font-mono">GET</code>, <code className="text-emerald-600 dark:text-emerald-400 font-mono">POST</code>, <code className="text-amber-600 dark:text-amber-400 font-mono">PUT</code>, <code className="text-purple-600 dark:text-purple-400 font-mono">PATCH</code>, or <code className="text-red-600 dark:text-red-400 font-mono">DELETE</code>.
            </li>
            <li>
              <strong className="text-blue-600 dark:text-cyan-300">JSON Payload Textarea:</strong> Provide request body data (e.g. <code className="text-slate-500 dark:text-slate-400 font-mono">{"{\"username\":\"admin\"}"}</code>) for scanning POST/PUT APIs.
            </li>
            <li>
              <strong className="text-blue-600 dark:text-cyan-300">Live Sparkline Analytics:</strong> Watch historical vulnerability counts and request latency trends on interactive SVG curves.
            </li>
          </ul>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 font-mono text-xs space-y-2 mt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span>TARGET REGISTRATION FORM SAMPLE</span>
              <span className="text-blue-600 dark:text-cyan-400">POST /api/v1/auth/login</span>
            </div>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <span className="text-slate-500 block">// Selected HTTP Method:</span>
              <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                POST
              </span>
              <span className="text-slate-500 block pt-2">// JSON Request Body Payload:</span>
              <pre className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
{`{
  "email": "security@company.com",
  "role": "ADMIN"
}`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    2: {
      step: 2,
      title: 'Automated Scan',
      subtitle: 'Step 2: Automated Security Assessment & CVSS Scoring',
      desc: 'What happens during scanning, what is CVSS 3.1, and how the Security Score is calculated.',
      icon: FlaskConical,
      color: 'text-purple-600 dark:text-purple-400 border-purple-500/40 bg-purple-500/10',
      navTo: '/assessments',
      navText: 'Launch Assessment Scan',
      content: (
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            When a security scan starts, Saksham AI sends automated payloads to inspect security headers, rate limiting, access controls (IDOR), and CORS configurations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <TechTooltip
                term="Security Score (e.g. 88/100)"
                tech="Calculated via formula: 100 - (Critical*15 + High*10 + Medium*5 + Low*2) with bonus weight for resolved items."
                simple="Your overall app safety grade. Higher score = safer app!"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">App safety rating from 0 to 100.</p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <TechTooltip
                term="CVSS v3.1 Score (0.0 to 10.0)"
                tech="Common Vulnerability Scoring System rating based on attack vector, complexity, privileges required, and confidentiality impact."
                simple="A grade from 0 to 10 showing how dangerous a bug is."
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standard severity score used worldwide.</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs space-y-3 mt-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-2">
              CVSS 3.1 SEVERITY SCALE BREAKDOWN
            </span>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-red-500/10 p-2 rounded border border-red-500/30 text-red-700 dark:text-red-300">
                <span>Critical Risk (9.0 – 10.0)</span>
                <span className="font-bold">Immediate Fix Needed</span>
              </div>
              <div className="flex justify-between items-center bg-orange-500/10 p-2 rounded border border-orange-500/30 text-orange-700 dark:text-orange-300">
                <span>High Risk (7.0 – 8.9)</span>
                <span className="font-bold">Fix within 48 Hours</span>
              </div>
              <div className="flex justify-between items-center bg-amber-500/10 p-2 rounded border border-amber-500/30 text-amber-700 dark:text-amber-300">
                <span>Medium Risk (4.0 – 6.9)</span>
                <span className="font-bold">Fix within 7 Days</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                <span>Low Risk (0.1 – 3.9)</span>
                <span className="font-bold">Informational / Best Practice</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    3: {
      step: 3,
      title: 'Finding Analysis',
      subtitle: 'Step 3: Analyze Findings & Technical PoC Evidence',
      desc: 'How to inspect vulnerability details, copy reproducible cURL PoCs, and view HTTP evidence logs.',
      icon: Bug,
      color: 'text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10',
      navTo: '/findings',
      navText: 'Inspect Findings Database',
      content: (
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            The <strong className="text-[#0f1f3d] dark:text-white font-mono">Findings</strong> database lists every discovered vulnerability with CWE classification, OWASP category, target endpoint, and SLA countdown timers.
          </p>
          <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300">
            <li>
              <TechTooltip
                term="PoC (Proof of Concept) cURL"
                tech="Command string that replicates exact HTTP headers, method, and body to trigger the vulnerability."
                simple="A 1-click test command to prove that the bug exists."
              />
            </li>
            <li>
              <strong className="text-blue-600 dark:text-cyan-300">Captured Technical Evidence:</strong> Displays raw HTTP status codes (e.g. <code className="text-blue-600 dark:text-cyan-400 font-mono">HTTP/401 Content-Security-Policy header is absent</code>).
            </li>
          </ul>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs font-mono space-y-2 mt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span>TECHNICAL EVIDENCE TRACE SAMPLE</span>
              <span className="text-emerald-600 dark:text-emerald-400">HTTP/401</span>
            </div>
            <pre className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
{`HTTP/1.1 401 Unauthorized
Content-Type: application/json
Date: Sun, 13 Sep 2026 14:55:00 GMT

// Missing Content-Security-Policy header in server response.`}
            </pre>
          </div>
        </div>
      ),
    },
    4: {
      step: 4,
      title: 'Code Remediation',
      subtitle: 'Step 4: Express Code Fix Snippets & Retesting',
      desc: 'How to copy ready-to-use Express.js code fixes and test if the vulnerability is fixed.',
      icon: Code2,
      color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      navTo: '/findings',
      navText: 'View Remediation Snippets',
      content: (
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            For every vulnerability, Saksham AI generates an instant <strong className="text-blue-600 dark:text-cyan-300">Express.js Security Snippet</strong> ready to paste into your backend code.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="text-blue-600 dark:text-cyan-400 font-bold block mb-0.5">1. Copy Code Fix:</span>
              <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">Click "Copy Code" and paste into your Express app.</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">2. Click "Pass" or "Fail":</span>
              <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">Run a retest to verify if the attack is blocked (<strong className="text-emerald-600 dark:text-emerald-400 font-sans">PASSED</strong>) or still reproducible (<strong className="text-red-600 dark:text-red-400 font-sans">FAILED</strong>).</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs font-mono space-y-2 mt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-blue-600 dark:text-cyan-400 flex items-center gap-1 font-bold">
                <Code2 className="h-3.5 w-3.5" /> EXPRESS FIX SNIPPET
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">Node.js / Express</span>
            </div>
            <pre className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
{`const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  }
}));`}
            </pre>
          </div>
        </div>
      ),
    },
    5: {
      step: 5,
      title: 'Audit & Reports',
      subtitle: 'Step 5: Activity Audit Log Stream & Executive Reports',
      desc: 'Track all security scan events, status updates, and download PDF audit reports.',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400 border-blue-500/40 bg-blue-500/10',
      navTo: '/reports',
      navText: 'View & Download Reports',
      content: (
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            The <strong className="text-[#0f1f3d] dark:text-white font-mono">Activity</strong> stream records every event with timestamps, actor IDs, and color-coded event badges.
          </p>
          <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-blue-600 dark:text-cyan-300">Live Event Feed:</strong> Displays scan execution, retest results (<code className="text-red-600 dark:text-red-400 font-mono">Retest FAILED</code> or <code className="text-emerald-600 dark:text-emerald-400 font-mono">Retest PASSED</code>), and status updates.
            </li>
            <li>
              <strong className="text-blue-600 dark:text-cyan-300">Executive PDF & HTML Reports:</strong> Go to <strong className="text-[#0f1f3d] dark:text-white font-mono">Reports</strong> to download compliance reports for clients or stakeholders.
            </li>
          </ul>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs font-mono space-y-2 mt-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-2 font-bold">
              REALTIME ACTIVITY LOG SAMPLE
            </span>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300 border border-red-500/30">
                  Retest FAILED
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">VUL-001 Missing CSP Header</span>
                <span className="text-slate-500 text-[10px]">14:52:58</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Retest PASSED
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">VUL-002 Rate Limiting</span>
                <span className="text-slate-500 text-[10px]">14:52:54</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="relative min-h-screen space-y-6 pb-16">
      {/* Page Header — synced to system */}
      <PageHeader
        icon={BookOpen}
        tone="cyan"
        title="Help & User Guide"
        subtitle="Learn how Saksham AI works with simple explanations, visual diagrams, and jargon definitions"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] px-3 py-1.5 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
              <Layers size={13} className="text-blue-600 dark:text-cyan-300" /> 5 Simple Steps
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-white dark:bg-gradient-to-r dark:from-emerald-950/60 dark:to-slate-900 px-3 py-1.5 font-mono text-[11px] font-bold text-[#0f1f3d] dark:text-white shadow-md">
              <CheckCircle2 size={13} className="text-emerald-700 dark:text-emerald-300" /> 100% Automated
            </span>
          </div>
        }
      />

      {/* Overview Intro Banner */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-r from-slate-900 dark:via-[#0b1325] dark:to-slate-900 p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30">
              <BookOpen className="h-3.5 w-3.5" />
              Beginner to enterprise guide
            </span>
            <h2 className="text-xl font-bold text-[#0f1f3d] dark:text-white tracking-tight">How Saksham AI Works</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Saksham AI automatically tests your web applications and REST APIs for security vulnerabilities, generates instant code remediation snippets, and keeps a complete audit log of all security activities. Hover over any underlined term in the app for both technical and plain-English definitions!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-center shadow-md">
              <span className="block text-2xl font-extrabold tracking-tight text-blue-600 dark:text-cyan-300 font-mono">5</span>
              <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Simple Steps</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-center shadow-md">
              <span className="block text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300 font-mono">100%</span>
              <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Automated</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3-Tier Roles, Responsibilities & Cost Governance */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white flex items-center gap-2">
              <PremiumIcon icon={ShieldCheck} tone="purple" size="sm" />
              <span>Roles & Responsibilities (RBAC & Cost Governance)</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Saksham AI implements strict 3-tier Role-Based Access Control to govern security operations and protect API/cloud scanning compute costs.
            </p>
          </div>
          <span className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            3 User Roles
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Admin Role */}
          <div className="group relative overflow-hidden rounded-xl border border-purple-200/70 dark:border-purple-500/30 bg-white/70 dark:bg-purple-950/20 backdrop-blur-xl p-4 space-y-3 shadow-[0_8px_24px_rgba(147,51,234,0.08)] transition hover:shadow-[0_12px_32px_rgba(147,51,234,0.16)] hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500/60 via-purple-400/30 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm">
                <Crown className="h-5 w-5" />
              </div>
              <span className="rounded-md border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Full Control
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f1f3d] dark:text-white">Administrator</h4>
              <p className="text-[11px] text-purple-700 dark:text-purple-300 font-mono">CISO · Lead Architect · Owner</p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
              <li>Views all organization analytics, targets, and projects</li>
              <li>Manages team accounts and organizational settings</li>
              <li>Oversees full forensic audit trails and activity logs</li>
              <li>Controls project scope and global compliance thresholds</li>
            </ul>
          </div>

          {/* Analyst Role */}
          <div className="group relative overflow-hidden rounded-xl border border-blue-200/70 dark:border-blue-500/30 bg-white/70 dark:bg-blue-950/20 backdrop-blur-xl p-4 space-y-3 shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition hover:shadow-[0_12px_32px_rgba(37,99,235,0.16)] hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500/60 via-blue-400/30 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <span className="rounded-md border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Scan & Verify
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f1f3d] dark:text-white">Security Analyst</h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-mono">SOC Engineer · Pentester · DevSecOps</p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
              <li>Registers target APIs and launches 8-stage live assessments</li>
              <li>Analyzes attack surfaces, routes, and technology stacks</li>
              <li>Verifies genuine vulnerabilities and eliminates false positives</li>
              <li>Runs Neural Threat Intelligence analysis and exports PDF reports</li>
            </ul>
          </div>

          {/* Viewer / Auditor Role */}
          <div className="group relative overflow-hidden rounded-xl border border-emerald-200/70 dark:border-emerald-500/30 bg-white/70 dark:bg-emerald-950/20 backdrop-blur-xl p-4 space-y-3 shadow-[0_8px_24px_rgba(16,185,129,0.08)] transition hover:shadow-[0_12px_32px_rgba(16,185,129,0.16)] hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/60 via-emerald-400/30 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Eye className="h-5 w-5" />
              </div>
              <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Read-Only · Cost Guard
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f1f3d] dark:text-white">Viewer / Auditor</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">Junior Developers · Stakeholders · Auditors</p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
              <li>Reads verified vulnerabilities, CVSS scores, and PoCs</li>
              <li>Follows step-by-step code remediation patch guidelines</li>
              <li>Downloads compliance and executive audit reports</li>
              <li><strong className="text-emerald-700 dark:text-emerald-300">Scan Disabled:</strong> Protects company budget by stopping unauthorized or accidental heavy AI/network scan costs</li>
            </ul>
          </div>
        </div>

        {/* Why Viewer Exists Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-3.5 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
          <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#0f1f3d] dark:text-white font-mono block mb-0.5">Why does Viewer / Read-Only access exist?</strong>
            Automated scanning and AI threat analysis consume live network probing bandwidth and AI model tokens. Giving <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Viewer access</span> to junior developers, external compliance auditors, or clients allows them to view vulnerabilities and follow fix guides without racking up expensive scan bills or generating unnecessary traffic on live servers.
          </div>
        </div>
      </Card>

      {/* Visual System Architecture Diagram */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 space-y-5 shadow-md">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <PremiumIcon icon={ActivityIcon} tone="cyan" size="sm" />
          <span>Interactive Security Workflow Diagram</span>
        </h3>

        {/* Workflow Diagram Steps */}
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { step: 1, title: 'Target Registration', desc: 'Add project API URL, HTTP Method & Payload', icon: FolderKanban, tone: 'cyan', color: 'text-blue-600 dark:text-cyan-300 border-blue-200 dark:border-cyan-500/25 bg-blue-50 dark:bg-cyan-500/[0.08]' },
            { step: 2, title: 'Automated Scan', desc: 'Active security testing & CVSS scoring', icon: FlaskConical, tone: 'purple', color: 'text-purple-700 dark:text-purple-300 border-purple-500/25 bg-purple-500/[0.08]' },
            { step: 3, title: 'Finding Analysis', desc: 'Inspect PoC cURL & HTTP evidence logs', icon: Bug, tone: 'amber', color: 'text-amber-700 dark:text-amber-300 border-amber-500/25 bg-amber-500/[0.08]' },
            { step: 4, title: 'Code Remediation', desc: 'Copy Express.js fix & retest target', icon: Code2, tone: 'emerald', color: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/25 bg-emerald-500/[0.08]' },
            { step: 5, title: 'Audit & Reports', desc: 'View Activity Stream & generate PDF', icon: FileText, tone: 'blue', color: 'text-blue-700 dark:text-blue-300 border-blue-500/25 bg-blue-500/[0.08]' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeStep === item.step;
            return (
              <div
                key={item.step}
                onClick={() => {
                  setActiveStep(item.step);
                  setModalStep(item.step);
                }}
                className={cn(
                  'flex flex-col justify-between rounded-xl border p-4 text-left transition duration-200 cursor-pointer group',
                  isSelected
                    ? 'bg-white/60 backdrop-blur-xl dark:bg-white/[0.08] backdrop-blur-xl border-slate-200 dark:border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-900'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {item.step}
                    </span>
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border', item.color)}>
                      <Icon size={15} strokeWidth={2.2} />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold tracking-tight text-[#0f1f3d] dark:text-white mb-1 group-hover:text-blue-700 dark:text-cyan-200 transition">{item.title}</h4>
                  <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStep(item.step);
                    setModalStep(item.step);
                  }}
                  className="mt-3 flex items-center font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-300 group-hover:underline"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Modal Dialog */}
      {modalStep && stepDetails[modalStep] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={() => setModalStep(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-4 sm:p-6 shadow-2xl z-10 space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600/20 font-mono text-base font-bold text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30">
                  {modalStep}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#0f1f3d] dark:text-white">{stepDetails[modalStep].subtitle}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{stepDetails[modalStep].desc}</p>
                </div>
              </div>
              <button
                onClick={() => setModalStep(null)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-[#0f1f3d] dark:hover:text-white transition"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div>{stepDetails[modalStep].content}</div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  disabled={modalStep <= 1}
                  onClick={() => setModalStep((s) => Math.max(1, s - 1))}
                  className="flex-1 sm:flex-initial min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  disabled={modalStep >= 5}
                  onClick={() => setModalStep((s) => Math.min(5, s + 1))}
                  className="flex-1 sm:flex-initial min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setModalStep(null)} className="flex-1 sm:flex-initial">
                  Close
                </Button>
                {stepDetails[modalStep].navTo && (
                  <Button
                    className="flex-1 sm:flex-initial"
                    onClick={() => {
                      setModalStep(null);
                      navigate(stepDetails[modalStep].navTo);
                    }}
                  >
                    {stepDetails[modalStep].navText} →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Detailed Explanations (Step 1 to Step 5) */}
      <div className="space-y-6">
        {/* Step 1 */}
        <Card className={cn('border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md space-y-4', activeStep === 1 && 'ring-1 ring-cyan-500/40')}>
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600/20 font-mono text-sm font-bold text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30">
              1
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Step 1: Register Target API / Web Service</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">How to add a target project endpoint, select HTTP methods, and provide JSON payloads</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                In the <strong className="text-[#0f1f3d] dark:text-white font-mono">Projects</strong> page, you register the target server endpoint you want to test.
              </p>
              <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300">
                <li>
                  <strong className="text-blue-600 dark:text-cyan-300">HTTP Method Selection:</strong> Choose between <code className="text-blue-600 dark:text-cyan-400 font-mono">GET</code>, <code className="text-emerald-600 dark:text-emerald-400 font-mono">POST</code>, <code className="text-amber-600 dark:text-amber-400 font-mono">PUT</code>, <code className="text-purple-600 dark:text-purple-400 font-mono">PATCH</code>, or <code className="text-red-600 dark:text-red-400 font-mono">DELETE</code>.
                </li>
                <li>
                  <strong className="text-blue-600 dark:text-cyan-300">JSON Payload Textarea:</strong> Provide request body data (e.g. <code className="text-slate-500 dark:text-slate-400 font-mono">{"{\"username\":\"admin\"}"}</code>) for scanning POST/PUT APIs.
                </li>
                <li>
                  <strong className="text-blue-600 dark:text-cyan-300">Live Sparkline Analytics:</strong> Watch historical vulnerability counts and request latency trends on interactive SVG curves.
                </li>
              </ul>
            </div>

            {/* Visual Code Box Diagram */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>TARGET REGISTRATION FORM SAMPLE</span>
                <span className="text-blue-600 dark:text-cyan-400">POST /api/v1/auth/login</span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <span className="text-slate-500 block">// Selected HTTP Method:</span>
                <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  POST
                </span>
                <span className="text-slate-500 block pt-2">// JSON Request Body Payload:</span>
                <pre className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
{`{
  "email": "security@company.com",
  "role": "ADMIN"
}`}
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className={cn('border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md space-y-4', activeStep === 2 && 'ring-1 ring-cyan-500/40')}>
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/20 font-mono text-sm font-bold text-purple-600 dark:text-purple-400 border border-purple-500/30">
              2
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Step 2: Automated Security Assessment & CVSS Scoring</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">What happens during scanning, what is CVSS 3.1, and how the Security Score is calculated</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                When a security scan starts, Saksham AI sends automated payloads to inspect security headers, rate limiting, access controls (IDOR), and CORS configurations.
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <TechTooltip
                    term="Security Score (e.g. 88/100)"
                    tech="Calculated via formula: 100 - (Critical*15 + High*10 + Medium*5 + Low*2) with bonus weight for resolved items."
                    simple="Your overall app safety grade. Higher score = safer app!"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">App safety rating from 0 to 100.</p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <TechTooltip
                    term="CVSS v3.1 Score (0.0 to 10.0)"
                    tech="Common Vulnerability Scoring System rating based on attack vector, complexity, privileges required, and confidentiality impact."
                    simple="A grade from 0 to 10 showing how dangerous a bug is."
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standard severity score used worldwide.</p>
                </div>
              </div>
            </div>

            {/* Severity Rating Scale Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs space-y-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-2">
                CVSS 3.1 SEVERITY SCALE BREAKDOWN
              </span>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center bg-red-500/10 p-2 rounded border border-red-500/30 text-red-700 dark:text-red-300">
                  <span>Critical Risk (9.0 – 10.0)</span>
                  <span className="font-bold">Immediate Fix Needed</span>
                </div>
                <div className="flex justify-between items-center bg-orange-500/10 p-2 rounded border border-orange-500/30 text-orange-700 dark:text-orange-300">
                  <span>High Risk (7.0 – 8.9)</span>
                  <span className="font-bold">Fix within 48 Hours</span>
                </div>
                <div className="flex justify-between items-center bg-amber-500/10 p-2 rounded border border-amber-500/30 text-amber-700 dark:text-amber-300">
                  <span>Medium Risk (4.0 – 6.9)</span>
                  <span className="font-bold">Fix within 7 Days</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <span>Low Risk (0.1 – 3.9)</span>
                  <span className="font-bold">Informational / Best Practice</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className={cn('border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md space-y-4', activeStep === 3 && 'ring-1 ring-cyan-500/40')}>
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-600/20 font-mono text-sm font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
              3
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Step 3: Analyze Findings & Technical PoC Evidence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">How to inspect vulnerability details, copy reproducible cURL PoCs, and view HTTP evidence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                The <strong className="text-[#0f1f3d] dark:text-white font-mono">Findings</strong> database lists every discovered vulnerability with CWE classification, OWASP category, target endpoint, and SLA countdown timers.
              </p>
              <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300">
                <li>
                  <TechTooltip
                    term="PoC (Proof of Concept) cURL"
                    tech="Command string that replicates exact HTTP headers, method, and body to trigger the vulnerability."
                    simple="A 1-click test command to prove that the bug exists."
                  />
                </li>
                <li>
                  <strong className="text-blue-600 dark:text-cyan-300">Captured Technical Evidence:</strong> Displays raw HTTP status codes (e.g. <code className="text-blue-600 dark:text-cyan-400 font-mono">HTTP/401 Content-Security-Policy header is absent</code>).
                </li>
              </ul>
            </div>

            {/* Technical Evidence Code Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>TECHNICAL EVIDENCE TRACE SAMPLE</span>
                <span className="text-emerald-600 dark:text-emerald-400">HTTP/401</span>
              </div>
              <pre className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
{`HTTP/1.1 401 Unauthorized
Content-Type: application/json
Date: Sun, 13 Sep 2026 14:55:00 GMT

// Missing Content-Security-Policy header in server response.`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Step 4 */}
        <Card className={cn('border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md space-y-4', activeStep === 4 && 'ring-1 ring-cyan-500/40')}>
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/20 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              4
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Step 4: Express Code Fix Snippets & Retesting</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">How to copy ready-to-use Express.js code fixes and test if the vulnerability is fixed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                For every vulnerability, Saksham AI generates an instant <strong className="text-blue-600 dark:text-cyan-300">Express.js Security Snippet</strong> ready to paste into your backend code.
              </p>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-blue-600 dark:text-cyan-400 font-bold block mb-0.5">1. Copy Code Fix:</span>
                  <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">Click the "Copy Code" button and paste into your Express app.</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">2. Click "Pass" or "Fail":</span>
                  <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">Run a retest to verify if the attack is blocked (<strong className="text-emerald-600 dark:text-emerald-400 font-sans">PASSED</strong>) or still reproducible (<strong className="text-red-600 dark:text-red-400 font-sans">FAILED</strong>).</span>
                </div>
              </div>
            </div>

            {/* Express Code Fix Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-blue-600 dark:text-cyan-400 flex items-center gap-1 font-bold">
                  <Code2 className="h-3.5 w-3.5" /> EXPRESS FIX SNIPPET
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">Node.js / Express</span>
              </div>
              <pre className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
{`const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  }
}));`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Step 5 */}
        <Card className={cn('border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md space-y-4', activeStep === 5 && 'ring-1 ring-cyan-500/40')}>
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 font-mono text-sm font-bold text-blue-600 dark:text-blue-400 border border-blue-500/30">
              5
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0f1f3d] dark:text-white">Step 5: Activity Audit Log Stream & Executive Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track all security scan events, status updates, and download PDF audit reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                The <strong className="text-[#0f1f3d] dark:text-white font-mono">Activity</strong> stream records every event with timestamps, actor IDs, and color-coded event badges.
              </p>
              <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300">
                <li>
                  <strong className="text-blue-600 dark:text-cyan-300">Live Event Feed:</strong> Displays scan execution, retest results (<code className="text-red-600 dark:text-red-400 font-mono">Retest FAILED</code> or <code className="text-emerald-600 dark:text-emerald-400 font-mono">Retest PASSED</code>), and status updates.
                </li>
                <li>
                  <strong className="text-blue-600 dark:text-cyan-300">Executive PDF & HTML Reports:</strong> Go to <strong className="text-[#0f1f3d] dark:text-white font-mono">Reports</strong> to download compliance reports for clients or stakeholders.
                </li>
              </ul>
            </div>

            {/* Activity Event Sample Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#040814] p-4 text-xs font-mono space-y-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-2 font-bold">
                REALTIME ACTIVITY LOG SAMPLE
              </span>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300 border border-red-500/30">
                    Retest FAILED
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">VUL-001 Missing CSP Header</span>
                  <span className="text-slate-500 text-[10px]">14:52:58</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Retest PASSED
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">VUL-002 Rate Limiting</span>
                  <span className="text-slate-500 text-[10px]">14:52:54</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Jargon Buster / Glossary Section */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[#0f1f3d] dark:text-white flex items-center gap-2">
              <PremiumIcon icon={HelpCircle} tone="cyan" size="sm" />
              <span>Jargon Buster & Term Glossary</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Search any cybersecurity term for both Technical and Simple English definitions</p>
          </div>

          <div className="relative w-full sm:w-72 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search CVSS, CWE, OWASP, SLA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950 min-h-[44px] py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredGlossary.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-2 shadow-sm transition hover:border-slate-200 dark:border-slate-700 hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold tracking-tight text-blue-700 dark:text-cyan-200 font-mono">{item.term}</h4>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-mono text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em] font-bold">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200">
                <span className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">Technical: </span>
                {item.tech}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-1.5 mt-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Simple: </span>
                {item.simple}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
