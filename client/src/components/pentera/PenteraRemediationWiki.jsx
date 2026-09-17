import React, { useState } from 'react';
import {
  Shield,
  BookOpen,
  Terminal,
  Server,
  Layers,
  Code2,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  AlertOctagon,
  Play,
  Settings2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, Button } from '../ui/primitives';

/**
 * PenteraRemediationWiki
 * Hardening playbook and configuration guide with dual Light/Dark mode support.
 */
export function PenteraRemediationWiki({ finding, className }) {
  if (!finding) return null;

  const wiki = finding.remediationWiki || {};
  const configs = Array.isArray(wiki.configs) && wiki.configs.length > 0 ? wiki.configs : [
    {
      platform: 'PowerShell',
      title: 'Local Security Hardening (PowerShell / Windows)',
      snippet: `# Enforce registry security policy and disable weak protocols\nNew-Item "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient" -Force -ErrorAction SilentlyContinue\nSet-ItemProperty "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient" -Name EnableMulticast -Value 0 -Type DWord -Force\nWrite-Host "[+] Local system hardening configuration applied." -ForegroundColor Green`,
      instructions: [
        'Open an elevated PowerShell prompt (Run as Administrator)',
        'Paste and execute the registry hardening command',
        'Verify registry key status using Get-ItemProperty',
      ],
    },
    {
      platform: 'GPO',
      title: 'Enterprise Active Directory Domain GPO',
      snippet: `1. Open Group Policy Management Console (gpmc.msc).\n2. Create or edit baseline hardening GPO.\n3. Navigate to: Computer Configuration -> Administrative Templates -> Network -> DNS Client.\n4. Enable: "Turn Off Multicast Name Resolution".\n5. Force policy propagation: gpupdate /force`,
      instructions: [
        'Open Group Policy Management Console (gpmc.msc)',
        'Navigate policy tree to DNS Client node',
        'Set configuration to Enabled and deploy across domain controllers',
      ],
    },
    {
      platform: 'Nginx / Web Server',
      title: 'Reverse Proxy & Web Server Hardening (Nginx)',
      snippet: `# Production Web Server Policy Directives\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "DENY" always;\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\nserver_tokens off;`,
      instructions: [
        'Insert directives into /etc/nginx/conf.d/security.conf or within server block',
        'Test syntax integrity: nginx -t',
        'Reload Nginx service: systemctl reload nginx',
      ],
    },
    {
      platform: 'App Code',
      title: 'Application Middleware Hardening (Node.js / Express)',
      snippet: `const helmet = require('helmet');\n\n// Mount comprehensive security header middleware\napp.use(helmet({\n  contentSecurityPolicy: true,\n  crossOriginEmbedderPolicy: false,\n  hsts: { maxAge: 31536000, includeSubDomains: true },\n}));`,
      instructions: [
        'Install security headers package in package.json',
        'Mount middleware prior to public API route handlers',
        'Execute integration test suite',
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedValidation, setCopiedValidation] = useState(false);

  const activeConfig = configs[activeTab] || configs[0] || {};
  const validationMethod = wiki.validationMethod || {
    command: `curl -i -s -k "${(finding.affectedAssets || [])[0] || 'http://localhost:3001/api'}" | head -n 30`,
    expectedResult: 'HTTP 200 OK with hardened security headers present and zero protocol leakage.',
    description: 'Execute this command against the target host to verify configuration change resolution.',
  };

  const copySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyValidationCmd = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedValidation(true);
    setTimeout(() => setCopiedValidation(false), 2000);
  };

  const getPlatformIcon = (platform) => {
    switch (String(platform).toLowerCase()) {
      case 'powershell':
        return <Terminal className="h-4 w-4" />;
      case 'gpo':
        return <Server className="h-4 w-4" />;
      case 'nginx / web server':
      case 'nginx':
        return <Layers className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950 dark:to-slate-950 p-0 shadow-lg dark:shadow-2xl backdrop-blur-xl transition-colors duration-200",
      className
    )}>
      {/* Header Styled like Pentera Remediation Wiki */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/15 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30 dark:ring-blue-500/40">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                SAKSHAM AI BLUEPRINT
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                REMEDIATION PLAYBOOK
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              {finding.title}
            </h3>
          </div>
        </div>

        {/* MITRE Reference Tag */}
        {wiki.mitreTechnique && (
          <a
            href={wiki.mitreUrl || `https://attack.mitre.org/techniques/T1190/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 transition hover:bg-purple-100 dark:hover:bg-purple-900/50 shadow-sm"
          >
            <span className="font-mono font-bold text-[11px] text-purple-600 dark:text-purple-400">MITRE ATT&CK:</span>
            <span>{wiki.mitreTechnique}</span>
            <ExternalLink className="h-3.5 w-3.5 ml-0.5 text-purple-600 dark:text-purple-400" />
          </a>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Insight & Root Cause */}
        <div className="rounded-xl border border-blue-200 dark:border-slate-800/80 bg-blue-50/50 dark:bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-400">
            <HelpCircle className="h-4 w-4" />
            <span>Insight & Architectural Root Cause</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {wiki.insight ||
              `The affected endpoint (${(finding.affectedAssets || [])[0] || 'target asset'}) was identified with unhardened configuration parameters. When defensive boundaries or security headers are omitted, adversaries can intercept communication, force authentication coercion, or abuse trust mechanisms.`}
          </p>
        </div>

        {/* Impact Flow */}
        <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50/60 dark:bg-red-950/15 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
            <AlertOctagon className="h-4 w-4" />
            <span>Adversary Exploitation & Operational Impact</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {wiki.impact ||
              `Attackers situated on adjacent network segments or public interfaces can leverage this flaw to harvest session artifacts, perform request coercion, or establish a foothold for internal lateral traversal.`}
          </p>
        </div>

        {/* Step-by-Step Configuration Change Engine */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <Settings2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Step-by-Step Configuration Change Playbook</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Select platform for hardening script</span>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {configs.map((cfg, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition duration-150 shadow-sm",
                  activeTab === idx
                    ? "bg-blue-600 text-white shadow-blue-500/20 shadow-lg border border-blue-400/40"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
                )}
              >
                {getPlatformIcon(cfg.platform)}
                <span>{cfg.platform || `Method ${idx + 1}`}</span>
              </button>
            ))}
          </div>

          {/* Active Configuration Blueprint */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-4 shadow-sm dark:shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-700 dark:text-cyan-300">
                {activeConfig.title || 'Configuration Change'}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copySnippet(activeConfig.snippet)}
                className="h-7 text-[11px] gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                <span>{copied ? 'Copied' : 'Copy Script'}</span>
              </Button>
            </div>

            {/* Code Block (Always dark for high syntax readability) */}
            <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-[#080d1a] font-mono text-xs text-slate-200 shadow-inner">
              <pre className="p-4 overflow-x-auto leading-relaxed text-emerald-400">
                {activeConfig.snippet}
              </pre>
            </div>

            {/* Step-by-Step Instructions */}
            {Array.isArray(activeConfig.instructions) && activeConfig.instructions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Implementation Steps:
                </span>
                <div className="grid gap-2 text-xs">
                  {activeConfig.instructions.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-blue-600 dark:text-cyan-400">
                        {sIdx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation & Verification Guide */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/15 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Play className="h-4 w-4" />
              <span>How to Validate Configuration Resolution</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyValidationCmd(validationMethod.command)}
              className="h-7 text-[11px] gap-1.5 border-emerald-300 dark:border-emerald-500/30 bg-white dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              {copiedValidation ? <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedValidation ? 'Copied' : 'Copy Test'}</span>
            </Button>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300">
            {validationMethod.description}
          </p>

          <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-[#080d1a] p-3 font-mono text-xs text-emerald-400 shadow-inner">
            {validationMethod.command}
          </pre>

          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Expected Result:</span>
            <span>{validationMethod.expectedResult}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
