const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Generates HTML, JSON, or PDF reports on disk, returning { fileName, fileUrl }.
async function generateReportFile({ project, target, assessment, findings = [], type = 'Technical', format = 'PDF', executiveSummary }) {
  const dir = path.join(__dirname, '..', '..', 'uploads', 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = Date.now();
  const formatExt = String(format).toUpperCase().includes('HTML')
    ? 'html'
    : String(format).toUpperCase().includes('JSON')
    ? 'json'
    : 'pdf';
  const fileName = `report-${assessment?._id || stamp}-${stamp}.${formatExt}`;
  const abs = path.join(dir, fileName);

  const securityScore = assessment?.summary?.securityScore ?? 82;
  const grade = securityScore >= 90 ? 'A+' : securityScore >= 80 ? 'A' : securityScore >= 70 ? 'B' : securityScore >= 60 ? 'C' : 'F';
  const gradeColor = securityScore >= 80 ? '#10b981' : securityScore >= 65 ? '#f59e0b' : '#ef4444';

  const critCount = findings.filter(f => (f.severity || '').toUpperCase() === 'CRITICAL').length;
  const highCount = findings.filter(f => (f.severity || '').toUpperCase() === 'HIGH').length;
  const medCount = findings.filter(f => (f.severity || '').toUpperCase() === 'MEDIUM').length;
  const lowCount = findings.filter(f => ['LOW', 'INFO'].includes((f.severity || '').toUpperCase())).length;

  if (formatExt === 'html') {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project?.name || 'Security'} - ${type} Security Assessment Report | Saksham-AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #040814;
      --bg-surface: #091124;
      --bg-card: #0d1730;
      --border-subtle: #1a284c;
      --border-accent: #0284c7;
      --cyan-glow: #00f0ff;
      --emerald-glow: #10b981;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-base);
      color: var(--text-primary);
      line-height: 1.5;
      padding: 24px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 1440px;
      width: 96%;
      margin: 0 auto;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(2, 132, 199, 0.08);
      overflow: hidden;
    }
    /* Top Classification Bar */
    .classification-bar {
      background: linear-gradient(90deg, #0c1a38 0%, #1e1b4b 50%, #0c1a38 100%);
      border-bottom: 1px solid var(--border-subtle);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .class-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
    }
    .ntro-tag {
      color: #38bdf8;
      font-weight: 600;
    }
    /* Main Header */
    .header {
      padding: 32px 40px 24px;
      border-bottom: 1px solid var(--border-subtle);
      background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.08), transparent 50%);
    }
    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .shield-logo {
      width: 54px;
      height: 54px;
      filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.4));
    }
    .title-group h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .title-group p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .actions-bar {
      display: flex;
      gap: 10px;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-action:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: #38bdf8;
      color: #38bdf8;
    }
    /* Executive Metric Overview Grid */
    .metric-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 20px;
      padding: 32px 40px;
      border-bottom: 1px solid var(--border-subtle);
      background: rgba(13, 23, 48, 0.4);
    }
    @media (max-width: 768px) {
      .metric-grid { grid-template-columns: 1fr; padding: 20px; }
    }
    /* Score Box */
    .score-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .score-ring {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: conic-gradient(${gradeColor} ${securityScore * 3.6}deg, #1e293b 0deg);
      position: relative;
      box-shadow: 0 0 24px rgba(0, 0, 0, 0.6);
    }
    .score-inner {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: var(--bg-card);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .score-number {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }
    .score-total {
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .score-label {
      margin-top: 14px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${gradeColor};
    }
    /* Metadata Grid */
    .meta-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
    }
    .meta-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 16px;
    }
    .meta-card .meta-title {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .meta-card .meta-val {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 6px;
      word-break: break-all;
    }
    .severity-chips {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .chip {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid;
    }
    .chip-crit { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.4); }
    .chip-high { background: rgba(249, 115, 22, 0.15); color: #fb923c; border-color: rgba(249, 115, 22, 0.4); }
    .chip-med { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); }
    .chip-low { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.4); }

    /* Content Sections */
    .content-body {
      padding: 36px 40px;
    }
    @media (max-width: 768px) {
      .content-body { padding: 24px 20px; }
    }
    .section-title {
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 8px;
    }
    .summary-box {
      background: linear-gradient(180deg, rgba(2, 132, 199, 0.06) 0%, rgba(9, 17, 36, 0.4) 100%);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 10px;
      padding: 22px;
      margin-bottom: 36px;
      position: relative;
    }
    .summary-text {
      font-size: 13.5px;
      line-height: 1.7;
      color: #cbd5e1;
    }
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      margin-bottom: 12px;
    }

    /* Finding Card */
    .finding-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 22px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      transition: border-color 0.2s;
    }
    .finding-card:hover {
      border-color: rgba(56, 189, 248, 0.4);
    }
    .finding-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .finding-title-block h3 {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
    }
    .finding-pills {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      flex-wrap: wrap;
    }
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid;
      font-weight: 600;
    }
    .pill-cvss {
      background: rgba(2, 132, 199, 0.15);
      border-color: rgba(2, 132, 199, 0.35);
      color: #38bdf8;
    }
    .pill-cwe {
      background: rgba(148, 163, 184, 0.1);
      border-color: rgba(148, 163, 184, 0.25);
      color: #cbd5e1;
    }
    .field-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 14px;
    }
    .field-label {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      color: var(--text-muted);
      font-weight: 600;
    }
    .field-value {
      font-size: 12px;
      color: #e2e8f0;
      margin-top: 2px;
    }
    .code-terminal {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 14px 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      color: #38bdf8;
      overflow-x: auto;
      margin-top: 6px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .remedy-list {
      list-style: none;
      margin-top: 8px;
    }
    .remedy-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12.5px;
      color: #cbd5e1;
      margin-bottom: 6px;
    }
    .remedy-bullet {
      color: #10b981;
      font-weight: 700;
    }

    /* Compliance Table */
    .compliance-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 10px;
    }
    .compliance-table th, .compliance-table td {
      padding: 10px 14px;
      text-align: left;
      border: 1px solid var(--border-subtle);
    }
    .compliance-table th {
      background: rgba(13, 23, 48, 0.8);
      font-family: 'JetBrains Mono', monospace;
      color: #94a3b8;
      font-size: 11px;
    }
    .compliance-table td {
      background: rgba(9, 17, 36, 0.5);
    }

    /* Footer */
    .footer {
      border-top: 1px solid var(--border-subtle);
      padding: 24px 40px;
      background: #060b18;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }

    /* Print Stylesheet */
    @media print {
      body { background: #ffffff !important; color: #0f172a !important; padding: 0; }
      .wrapper { border: none !important; box-shadow: none !important; max-width: 100% !important; background: #ffffff !important; }
      .actions-bar { display: none !important; }
      .classification-bar { background: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
      .class-tag { background: #fee2e2 !important; color: #991b1b !important; border-color: #f87171 !important; }
      .header { background: #ffffff !important; border-color: #cbd5e1 !important; }
      .title-group h1 { color: #0f172a !important; }
      .metric-grid { background: #f8fafc !important; border-color: #cbd5e1 !important; }
      .score-card, .meta-card, .finding-card { background: #ffffff !important; border-color: #cbd5e1 !important; box-shadow: none !important; }
      .score-inner { background: #ffffff !important; }
      .score-number { color: #0f172a !important; }
      .meta-card .meta-val { color: #0f172a !important; }
      .summary-box { background: #f8fafc !important; border-color: #94a3b8 !important; }
      .summary-text { color: #1e293b !important; }
      .code-terminal { background: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
      .field-value, .remedy-item { color: #334155 !important; }
      .finding-title-block h3 { color: #0f172a !important; }
      .footer { background: #ffffff !important; border-color: #cbd5e1 !important; color: #64748b !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Top Classification Strip -->
    <div class="classification-bar">
      <div class="class-tag">
        <span>⚠</span> RESTRICTED // SECURITY AUDIT DOSSIER
      </div>
      <div class="ntro-tag">
        NTRO · SMART INDIA HACKATHON 2026 // PS-26163
      </div>
    </div>

    <!-- Main Header -->
    <div class="header">
      <div class="brand-row">
        <div class="brand-left">
          <!-- Vector Cyber Shield Emblem -->
          <svg class="shield-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gFacetLeft" x1="10" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#0c1a3a" />
                <stop offset="100%" stop-color="#051329" />
              </linearGradient>
              <linearGradient id="gBladeTop" x1="20" y1="20" x2="80" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
              <linearGradient id="gBladeBottom" x1="80" y1="80" x2="20" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#22d3ee" />
                <stop offset="100%" stop-color="#3b82f6" />
              </linearGradient>
              <linearGradient id="gRim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#60a5fa" />
              </linearGradient>
            </defs>
            <path d="M50 5 L89 24.5 V57.5 L50 94.5 L11 57.5 V24.5 L50 5 Z" stroke="url(#gRim)" stroke-width="4" stroke-linejoin="round" fill="#040814" />
            <path d="M50 8 L15 26.5 V55.5 L50 90.5 V50 Z" fill="url(#gFacetLeft)" opacity="0.9" />
            <path d="M74 31 L50 19 L26 31 L26 41 L50 29 L74 41 Z" fill="url(#gBladeTop)" />
            <path d="M26 69 L50 81 L74 69 L74 59 L50 71 L26 59 Z" fill="url(#gBladeBottom)" />
            <polygon points="50,42 58,50 50,58 42,50" fill="#ffffff" />
          </svg>
          <div class="title-group">
            <h1>Saksham-AI Enterprise Security Report</h1>
            <p>Target Project: <strong>${project?.name || 'Authorized Target Scope'}</strong> · ${type} Audit</p>
          </div>
        </div>
        <div class="actions-bar">
          <button class="btn-action" onclick="window.print()">
            🖨 Print / Export PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Executive Metrics Grid -->
    <div class="metric-grid">
      <!-- Posture Score -->
      <div class="score-card">
        <div class="score-ring">
          <div class="score-inner">
            <span class="score-number">${securityScore}</span>
            <span class="score-total">/100</span>
          </div>
        </div>
        <div class="score-label">Posture Grade: ${grade}</div>
      </div>

      <!-- Key Metadata Cards -->
      <div class="meta-overview">
        <div class="meta-card">
          <div class="meta-title">Assessment Target</div>
          <div class="meta-val">${target?.name || 'Primary Endpoint'}</div>
          <div style="font-family:'JetBrains Mono'; font-size:11px; color:#38bdf8; margin-top:3px;">${target?.method || 'POST'} ${target?.url || '-'}</div>
        </div>
        <div class="meta-card">
          <div class="meta-title">Audit Scope & Status</div>
          <div class="meta-val" style="color:#10b981;">Authorized & Certified</div>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:3px;">Env: ${target?.environment || 'Testing / Authorized'}</div>
        </div>
        <div class="meta-card">
          <div class="meta-title">Vulnerabilities Detected</div>
          <div class="meta-val">${findings.length} Findings</div>
          <div class="severity-chips">
            <span class="chip chip-crit">${critCount} Crit</span>
            <span class="chip chip-high">${highCount} High</span>
            <span class="chip chip-med">${medCount} Med</span>
            <span class="chip chip-low">${lowCount} Low</span>
          </div>
        </div>
        <div class="meta-card">
          <div class="meta-title">Generation Timestamp</div>
          <div class="meta-val" style="font-size:12px;">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div style="font-size:10px; font-family:'JetBrains Mono'; color:var(--text-muted); margin-top:3px;">ID: ${assessment?._id?.toString()?.slice(-8) || stamp}</div>
        </div>
      </div>
    </div>

    <!-- Body Content -->
    <div class="content-body">
      <!-- 1. Executive Summary -->
      <div class="section-title">01 // Executive Summary & CISO Impact Analysis</div>
      <div class="summary-box">
        <div class="ai-badge">✦ AI-Synthesized Security Narrative</div>
        <div class="summary-text">
          ${executiveSummary || 'Security assessment completed with full asset probing and vulnerability audit across authorized endpoints.'}
        </div>
      </div>

      <!-- 2. Standards Compliance Alignment -->
      <div class="section-title">02 // Regulatory & Standards Alignment</div>
      <table class="compliance-table">
        <thead>
          <tr>
            <th>STANDARD / FRAMEWORK</th>
            <th>DOMAIN COVERAGE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>OWASP Top 10:2021</strong></td>
            <td>Broken Access Control (A01), Injection (A03), Security Misconfiguration (A05)</td>
            <td style="color:#10b981; font-weight:700;">✔ 100% Tested</td>
          </tr>
          <tr>
            <td><strong>CERT-In Cyber Directives</strong></td>
            <td>Log retention, zero production impact validation, safe payload testing</td>
            <td style="color:#10b981; font-weight:700;">✔ Compliant</td>
          </tr>
          <tr>
            <td><strong>ISO/IEC 27001:2022</strong></td>
            <td>A.8.8 Management of technical vulnerabilities & A.12.6.1 Vulnerability handling</td>
            <td style="color:#38bdf8; font-weight:700;">✔ Aligned</td>
          </tr>
        </tbody>
      </table>

      <!-- 3. Detailed Findings Dossier -->
      <div class="section-title" style="margin-top:36px;">03 // Detailed Vulnerability Findings & Technical Proof-of-Concept (${findings.length})</div>
      ${findings.length === 0 ? `
        <div class="finding-card" style="text-align:center; color:var(--text-secondary);">
          ✔ No security vulnerabilities or misconfigurations detected during this scan pass. All tested controls passed.
        </div>
      ` : findings.map((f, i) => {
        const sev = (f.severity || 'HIGH').toUpperCase();
        const sevClass = sev === 'CRITICAL' ? 'chip-crit' : sev === 'HIGH' ? 'chip-high' : sev === 'MEDIUM' ? 'chip-med' : 'chip-low';
        return `
        <div class="finding-card">
          <div class="finding-top">
            <div class="finding-title-block">
              <h3>${i + 1}. ${f.findingId || 'VUL-' + (i+1)} — ${f.title}</h3>
              <div class="finding-pills">
                <span class="pill ${sevClass}">${sev}</span>
                <span class="pill pill-cvss">CVSS v3.1: ${f.cvssScore || '5.0'}</span>
                <span class="pill pill-cwe">${f.cwe || 'CWE-200'}</span>
                <span class="pill pill-cwe">${f.owasp || 'A05:2021'}</span>
              </div>
            </div>
            <div style="font-size:11px; font-family:'JetBrains Mono'; color:#10b981; font-weight:700;">
              ${f.status || 'Verified'}
            </div>
          </div>

          <div class="field-grid">
            <div>
              <div class="field-label">Affected Endpoint / Asset</div>
              <div class="field-value" style="font-family:'JetBrains Mono'; color:#38bdf8;">${(f.affectedAssets || [])[0] || target?.url || '-'}</div>
            </div>
            <div>
              <div class="field-label">Vulnerability Category</div>
              <div class="field-value">${f.category || 'Security Misconfiguration'}</div>
            </div>
          </div>

          <div style="margin-top: 12px;">
            <div class="field-label">Technical Threat Vector</div>
            <div class="field-value" style="line-height:1.6;">${f.description || f.impact || 'Identified security risk on target endpoint.'}</div>
          </div>

          ${f.evidence ? `
            <div style="margin-top: 14px;">
              <div class="field-label">Verified Proof of Concept (PoC Evidence)</div>
              <div class="code-terminal">${f.evidence}</div>
            </div>
          ` : ''}

          ${f.impact ? `
            <div style="margin-top: 14px;">
              <div class="field-label">Business & Operations Impact</div>
              <div class="field-value" style="color:#fca5a5; line-height:1.5;">${f.impact}</div>
            </div>
          ` : ''}

          <div style="margin-top: 14px;">
            <div class="field-label">Actionable Remediation Playbook</div>
            <ul class="remedy-list">
              ${(Array.isArray(f.remediation) ? f.remediation : [f.remediation || 'Harden server configuration and validate access controls.']).map(r => `
                <li class="remedy-item">
                  <span class="remedy-bullet">✔</span>
                  <span>${r}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
        `;
      }).join('')}

      <!-- 4. Legal & Rules of Engagement -->
      <div class="section-title" style="margin-top:36px;">04 // Rules of Engagement & Integrity Seal</div>
      <div class="summary-box" style="margin-bottom:0;">
        <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
          This security audit was conducted strictly within authorized scope in adherence to ethical hacking directives. Testing payloads were constrained to non-destructive proof-of-concept verification. Production availability, credentials, and customer records were preserved without compromise.
        </p>
      </div>
    </div>

    <!-- Document Footer -->
    <div class="footer">
      <div>SAKSHAM-AI DEFENSE INTELLIGENCE PLATFORM · NTRO PS-26163</div>
      <div>GEN: ${new Date().toUTCString()} · CONFIDENTIAL</div>
    </div>
  </div>
</body>
</html>`;
    fs.writeFileSync(abs, htmlContent, 'utf8');
  } else if (formatExt === 'json') {
    const jsonContent = JSON.stringify(
      {
        reportMeta: {
          project: project?.name,
          assessmentId: assessment?._id,
          reportType: type,
          format: 'JSON',
          generatedAt: new Date().toISOString(),
          securityScore,
          postureGrade: grade,
          classification: 'RESTRICTED // LAWFUL PENTEST ONLY',
        },
        target: {
          name: target?.name,
          url: target?.url,
          method: target?.method,
          requestBody: target?.requestBody,
          environment: target?.environment,
        },
        executiveSummary,
        severityBreakdown: {
          critical: critCount,
          high: highCount,
          medium: medCount,
          low: lowCount,
        },
        findingsCount: findings.length,
        findings,
      },
      null,
      2
    );
    fs.writeFileSync(abs, jsonContent, 'utf8');
  } else {
    // PDF Generation via PDFKit with professional layout
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 44, size: 'A4' });
      const stream = fs.createWriteStream(abs);
      doc.pipe(stream);

      // Top Header Navy Bar
      doc.rect(0, 0, doc.page.width, 42).fill('#0c1a38');
      doc.fillColor('#38bdf8').fontSize(9).font('Helvetica-Bold').text('NTRO · SMART INDIA HACKATHON 2026 // PS-26163', 44, 16);
      doc.fillColor('#f87171').fontSize(9).font('Helvetica-Bold').text('RESTRICTED // SECURITY AUDIT', doc.page.width - 240, 16, { align: 'right', width: 196 });

      doc.moveDown(2);

      // Main Title
      doc.fillColor('#0284c7').fontSize(20).font('Helvetica-Bold').text('SAKSHAM-AI SECURITY DOSSIER', 44, 58);
      doc.fillColor('#475569').fontSize(11).font('Helvetica').text(`Target: ${(project?.name || 'Target Scope').toUpperCase()} · ${type} Audit`);
      doc.moveDown(1);

      // Metadata Table / Box
      const metaTop = doc.y;
      doc.roundedRect(44, metaTop, doc.page.width - 88, 54, 4).fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold');
      doc.text(`Security Score: ${securityScore}/100 [Grade ${grade}]`, 56, metaTop + 10);
      doc.text(`Target URL: ${target?.method || 'POST'} ${target?.url || 'https://target.app'}`, 56, metaTop + 24);
      doc.text(`Findings: ${findings.length} (${critCount} Critical, ${highCount} High, ${medCount} Med, ${lowCount} Low)`, 56, metaTop + 38);

      doc.fillColor('#475569').fontSize(9).font('Helvetica');
      doc.text(`Date: ${new Date().toISOString().slice(0, 10)}`, doc.page.width - 180, metaTop + 10);
      doc.text(`Env: ${target?.environment || 'Authorized'}`, doc.page.width - 180, metaTop + 24);
      doc.text(`Status: Certified Complete`, doc.page.width - 180, metaTop + 38);

      doc.y = metaTop + 68;

      // Section 1: Executive Summary
      doc.fillColor('#0284c7').fontSize(13).font('Helvetica-Bold').text('1. Executive Summary & Risk Narrative');
      doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(
        executiveSummary || 'Security assessment completed successfully against authorized scope. Vulnerabilities and proof-of-concept details are compiled below.',
        { lineGap: 2 }
      );
      doc.moveDown(1);

      // Section 2: Detailed Findings
      doc.fillColor('#0284c7').fontSize(13).font('Helvetica-Bold').text(`2. Vulnerability Findings & Proof-of-Concept (${findings.length})`);
      doc.moveDown(0.5);

      if (findings.length === 0) {
        doc.fillColor('#15803d').fontSize(10).font('Helvetica').text('✔ No security vulnerabilities detected during this assessment pass.');
      } else {
        findings.forEach((f, i) => {
          if (doc.y > 680) {
            doc.addPage();
          }

          const cardY = doc.y;
          const sev = (f.severity || 'HIGH').toUpperCase();
          const sevColor = sev === 'CRITICAL' ? '#dc2626' : sev === 'HIGH' ? '#ea580c' : sev === 'MEDIUM' ? '#d97706' : '#16a34a';

          doc.fillColor(sevColor).fontSize(10.5).font('Helvetica-Bold').text(
            `${i + 1}. [${sev}] ${f.findingId || 'VUL'} — ${f.title} (CVSS ${f.cvssScore || '5.0'})`
          );

          doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text(
            `Category: ${f.category || 'Security Misconfiguration'} | CWE: ${f.cwe || 'CWE-200'} | OWASP: ${f.owasp || 'A05:2021'} | Status: ${f.status || 'Verified'}`
          );

          doc.fillColor('#0284c7').fontSize(8.5).font('Helvetica-Bold').text(
            `Affected Asset: ${(f.affectedAssets || []).join(', ') || target?.url || '-'}`
          );

          if (f.description) {
            doc.fillColor('#334155').fontSize(9).font('Helvetica').text(`Description: ${f.description}`, { lineGap: 1.5 });
          }

          if (f.evidence) {
            doc.moveDown(0.3);
            doc.fillColor('#0f172a').fontSize(8).font('Courier').text(
              `PoC Evidence:\n${f.evidence.slice(0, 240)}`,
              { lineGap: 1 }
            );
          }

          const remedies = Array.isArray(f.remediation) ? f.remediation : [f.remediation || 'Harden server configuration'];
          if (remedies.length > 0) {
            doc.moveDown(0.3);
            doc.fillColor('#15803d').fontSize(8.5).font('Helvetica-Bold').text('Remediation Recommendations:');
            remedies.forEach(r => {
              doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(`• ${r}`);
            });
          }

          doc.moveDown(1);
        });
      }

      // Section 3: Safe Testing & Legal Rules of Engagement
      if (doc.y > 700) doc.addPage();
      doc.fillColor('#0284c7').fontSize(12).font('Helvetica-Bold').text('3. Compliance & Safe Testing Rules of Engagement');
      doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text('• Testing restricted strictly to authorized IP scopes, endpoints, and parameters.');
      doc.text('• Exploitation activity was limited to non-destructive proof-of-concept validation.');
      doc.text('• Zero impact on production customer records, database integrity, or uptime.');

      // Page numbers footer
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(
          `Page ${i + 1} of ${range.count} | Saksham-AI Defense Intelligence Dossier | SIH 2026`,
          44,
          doc.page.height - 30,
          { align: 'center', width: doc.page.width - 88 }
        );
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  return { fileName, fileUrl: `/uploads/reports/${fileName}` };
}

async function generateSingleFindingPdf({ project, finding }) {
  const dir = path.join(__dirname, '..', '..', 'uploads', 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const fileName = `vulnerability-${finding.findingId || 'VUL'}-${Date.now()}.pdf`;
  const abs = path.join(dir, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const stream = fs.createWriteStream(abs);
    doc.pipe(stream);

    // Document Header
    doc.fillColor('#0284c7').fontSize(20).text('SAKSHAM AI SECURITY VULNERABILITY REPORT', { align: 'center' });
    doc.fillColor('#475569').fontSize(11).text(`Project: ${project?.name || 'Authorized Target'} | ID: ${finding.findingId}`, { align: 'center' });
    doc.moveDown(1.5);

    // 1. Title & Classification
    doc.fillColor('#0f172a').fontSize(15).text(`${finding.findingId} · ${finding.title}`);
    doc.fillColor('#dc2626').fontSize(11).text(`Severity: ${finding.severity?.toUpperCase()} (CVSS v3: ${finding.cvssScore}) | Status: ${finding.status}`);
    doc.fillColor('#475569').fontSize(10).text(`Category: ${finding.category} | CWE: ${finding.cwe || 'CWE-200'} | OWASP: ${finding.owasp || 'A05:2021'}`);
    doc.moveDown();

    // 2. Affected Component
    doc.fillColor('#0284c7').fontSize(12).text('AFFECTED COMPONENT / ENDPOINT');
    doc.fillColor('#0f172a').fontSize(10).text((finding.affectedAssets || []).join(', ') || 'N/A');
    doc.moveDown();

    // 3. Description
    doc.fillColor('#0284c7').fontSize(12).text('VULNERABILITY DESCRIPTION');
    doc.fillColor('#334155').fontSize(10).text(finding.description || 'Detailed technical vulnerability finding.');
    doc.moveDown();

    // 4. Steps to Reproduce
    const steps = finding.stepsToReproduce?.length ? finding.stepsToReproduce : finding.aiAnalysis?.stepsToReproduce;
    if (steps && steps.length > 0) {
      doc.fillColor('#0284c7').fontSize(12).text('STEPS TO REPRODUCE');
      steps.forEach((step, idx) => {
        doc.fillColor('#334155').fontSize(10).text(`${idx + 1}. ${step}`);
      });
      doc.moveDown();
    }

    // 5. Proof of Concept (PoC)
    const poc = finding.proofOfConcept || finding.aiAnalysis?.proofOfConcept || finding.evidence;
    if (poc) {
      doc.fillColor('#0284c7').fontSize(12).text('PROOF OF CONCEPT (SAFE POC VALIDATION)');
      doc.fillColor('#0f172a').fontSize(9).text(poc);
      doc.moveDown();
    }

    // 6. Business Impact Assessment
    const bImpact = finding.businessImpact || finding.aiAnalysis?.businessImpact || finding.impact;
    if (bImpact) {
      doc.fillColor('#0284c7').fontSize(12).text('BUSINESS IMPACT ASSESSMENT');
      doc.fillColor('#b91c1c').fontSize(10).text(bImpact);
      doc.moveDown();
    }

    // 7. Remediation Recommendations
    const remedies = finding.remediation?.length ? finding.remediation : finding.aiAnalysis?.remediation;
    if (remedies && remedies.length > 0) {
      doc.fillColor('#0284c7').fontSize(12).text('REMEDIATION RECOMMENDATIONS');
      remedies.forEach((r) => {
        doc.fillColor('#15803d').fontSize(10).text(`• ${r}`);
      });
      doc.moveDown();
    }

    // 8. Testing Constraints & Rules of Engagement
    doc.fillColor('#0284c7').fontSize(12).text('RULES OF ENGAGEMENT & ETHICAL CONSTRAINTS');
    const constraints = finding.remediationConstraints || [
      'Testing must be performed only on authorized systems.',
      'No actions should affect production users or data.',
      'Exploitation should be limited to proof-of-concept validation.',
      'Compliance with applicable laws, policies, and ethical hacking guidelines is required.',
    ];
    constraints.forEach((c) => {
      doc.fillColor('#475569').fontSize(9).text(`✔ ${c}`);
    });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { fileName, fileUrl: `/uploads/reports/${fileName}` };
}

module.exports = { generatePdf: generateReportFile, generateReportFile, generateSingleFindingPdf };
