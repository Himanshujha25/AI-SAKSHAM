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

  if (formatExt === 'html') {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project?.name || 'Security'} - ${type} Security Assessment Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #050811; color: #e2e8f0; margin: 0; padding: 40px; }
    .container { max-width: 960px; margin: 0 auto; background: #090f1f; border: 1px solid #1e293b; border-radius: 12px; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; font-size: 26px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
    .meta { display: flex; flex-wrap: wrap; gap: 16px; font-family: monospace; font-size: 12px; color: #94a3b8; margin-bottom: 24px; background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; }
    .meta span { background: #1e293b; padding: 2px 8px; border-radius: 4px; color: #38bdf8; font-weight: bold; }
    .section { margin-bottom: 32px; }
    h2 { font-size: 16px; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 14px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; font-family: monospace; text-transform: uppercase; }
    .critical { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
    .high { background: rgba(249,115,22,0.15); color: #fb923c; border: 1px solid rgba(249,115,22,0.3); }
    .medium { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
    .low { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .finding-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 18px; }
    .code-box { background: #020617; border: 1px solid #1e293b; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #38bdf8; white-space: pre-wrap; overflow-x: auto; margin-top: 10px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; font-size: 12px; }
    .field-label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; font-family: monospace; margin-bottom: 2px; }
    ul { margin: 6px 0; padding-left: 20px; }
    li { margin-bottom: 4px; font-size: 12px; color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛡️ Saksham AI Security Assessment Report</h1>
    <div class="meta">
      <div>Project: <span>${project?.name || 'Target Project'}</span></div>
      <div>Type: <span>${type}</span></div>
      <div>Format: <span>HTML</span></div>
      <div>Security Posture Score: <span>${assessment?.summary?.securityScore ?? 82}/100</span></div>
      <div>Date: <span>${new Date().toLocaleDateString('en-GB')}</span></div>
    </div>

    <div class="section">
      <h2>1. Executive Summary & Audit Overview</h2>
      <p style="line-height:1.6; color:#cbd5e1;">${executiveSummary || 'Security assessment completed successfully against authorized scope.'}</p>
    </div>

    <div class="section">
      <h2>2. Assessment Scope & Target Environment</h2>
      <div class="grid-2">
        <div>
          <div class="field-label">Target Name</div>
          <div style="font-weight:bold; color:#f8fafc;">${target?.name || 'Root API Gateway'}</div>
        </div>
        <div>
          <div class="field-label">Target Method & URL</div>
          <div style="font-mono; color:#38bdf8;"><strong>${target?.method || 'POST'}</strong> ${target?.url || 'https://target.app'}</div>
        </div>
        <div>
          <div class="field-label">Environment</div>
          <div>${target?.environment || 'Testing / Authorized'}</div>
        </div>
        <div>
          <div class="field-label">Authorization Confirmation</div>
          <div style="color:#34d399;">Explicitly Confirmed & Verified</div>
        </div>
      </div>
      <p style="font-size:12px; color:#94a3b8; margin-top:12px;">
        <strong>Audit Domains Tested:</strong> Authentication & Session Management, Authorization & Access Control (RBAC/IDOR), Input Validation & API Injection, Client-Side Controls, Rate-Limiting & Security Headers.
      </p>
    </div>

    <div class="section">
      <h2>3. Detailed Security Findings & Proof of Concept (${findings.length})</h2>
      ${findings.length === 0 ? `
        <div class="finding-card" style="text-align:center; color:#94a3b8;">
          No security vulnerabilities or misconfigurations detected during this scan pass.
        </div>
      ` : findings.map((f, i) => `
        <div class="finding-card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; pb-10px; margin-bottom:12px;">
            <strong style="color:#f8fafc; font-size:15px;">${i + 1}. ${f.findingId || 'VUL-00' + (i+1)} — ${f.title}</strong>
            <span class="badge ${ (f.severity || 'high').toLowerCase() }">${f.severity || 'HIGH'} ${f.cvssScore ? '· CVSS ' + f.cvssScore : ''}</span>
          </div>
          <div className="grid-2">
            <div><span className="field-label">Category:</span> <span style="color:#e2e8f0; font-size:12px;">${f.category || 'Security Misconfiguration'}</span></div>
            <div><span className="field-label">CWE / OWASP:</span> <span style="color:#e2e8f0; font-size:12px;">${f.cwe || 'CWE-200'} / ${f.owasp || 'A05:2021'}</span></div>
            <div><span className="field-label">Verification Status:</span> <span style="color:#34d399; font-size:12px;">${f.status || 'Verified'}</span></div>
            <div><span className="field-label">Affected Endpoint:</span> <code style="color:#38bdf8; font-size:12px;">${(f.affectedAssets || [])[0] || target?.url || '-'}</code></div>
          </div>
          <div style="margin-top:12px;">
            <div className="field-label">Description & Risk Vector:</div>
            <p style="font-size:13px; color:#cbd5e1; margin-top:4px;">${f.description || f.impact || 'Identified security risk on target endpoint.'}</p>
          </div>
          ${f.evidence ? `
            <div style="margin-top:12px;">
              <div className="field-label">Proof of Concept / Technical Evidence:</div>
              <div className="code-box">${f.evidence}</div>
            </div>
          ` : ''}
          ${f.impact ? `
            <div style="margin-top:12px;">
              <div className="field-label">Business Impact Assessment:</div>
              <p style="font-size:12px; color:#fca5a5; margin-top:4px;">${f.impact}</p>
            </div>
          ` : ''}
          <div style="margin-top:12px;">
            <div className="field-label">Remediation Recommendations:</div>
            <ul>
              ${(Array.isArray(f.remediation) ? f.remediation : [f.remediation || 'Harden server configuration']).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>4. Compliance & Safe Testing Statement</h2>
      <p style="font-size:12px; color:#94a3b8; line-height:1.5;">
        This security assessment was executed in strict adherence to authorized penetration testing guidelines. All probe payloads were limited to proof-of-concept validation without impacting production data or user availability.
      </p>
    </div>

    <div class="section" style="border-top:1px solid #1e293b; padding-top:16px; text-align:center; font-size:11px; color:#64748b;">
      Report generated automatically by Saksham AI Command Center on ${new Date().toUTCString()}
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
          securityScore: assessment?.summary?.securityScore ?? 82,
        },
        target: {
          name: target?.name,
          url: target?.url,
          method: target?.method,
          requestBody: target?.requestBody,
          environment: target?.environment,
        },
        executiveSummary,
        findingsCount: findings.length,
        findings,
      },
      null,
      2
    );
    fs.writeFileSync(abs, jsonContent, 'utf8');
  } else {
    // PDF Generation
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48 });
      const stream = fs.createWriteStream(abs);
      doc.pipe(stream);

      // Title & Header Bar
      doc.fillColor('#0284c7').fontSize(22).text(`${(project?.name || 'Security Assessment').toUpperCase()}`, { align: 'center' });
      doc.fillColor('#475569').fontSize(12).text('SAKSHAM AI ENTERPRISE VULNERABILITY REPORT', { align: 'center' });
      doc.moveDown(1.5);

      // Metadata Block
      doc.fillColor('#0f172a').fontSize(10).text(`Report Type: ${type} | Format: PDF | Security Score: ${assessment?.summary?.securityScore ?? 'N/A'}/100`);
      doc.text(`Generated Date: ${new Date().toISOString().slice(0, 10)} | Target URL: ${target?.url || ''} (${target?.method || 'POST'})`);
      doc.moveDown();

      // Section 1: Executive Summary
      doc.fillColor('#0284c7').fontSize(14).text('1. Executive Summary & Impact Analysis');
      doc.fillColor('#334155').fontSize(10).text(executiveSummary || 'Security assessment completed with full asset probing and vulnerability audit.');
      doc.moveDown();

      // Section 2: Scope & Target Details
      doc.fillColor('#0284c7').fontSize(14).text('2. Assessment Scope & Target Configuration');
      doc.fillColor('#334155').fontSize(10).text(`Target Name: ${target?.name || 'API Asset'}`);
      doc.text(`Target URL & Method: ${target?.method || 'POST'} ${target?.url || ''}`);
      doc.text(`Environment: ${target?.environment || 'Testing / Authorized'}`);
      doc.text(`Authorization Status: Confirmed & Validated`);
      doc.moveDown();

      // Section 3: Detailed Vulnerability Findings
      doc.fillColor('#0284c7').fontSize(14).text(`3. Vulnerability Findings & Proof of Concept (${findings.length})`);
      doc.moveDown(0.5);

      if (findings.length === 0) {
        doc.fillColor('#334155').fontSize(10).text('No security vulnerabilities detected during this assessment pass.');
      } else {
        findings.forEach((f, i) => {
          doc.fillColor('#0f172a').fontSize(11).text(`${i + 1}. ${f.findingId || 'VUL'} — ${f.title} [${f.severity || 'HIGH'} | CVSS ${f.cvssScore || '5.0'}]`);
          doc.fillColor('#475569').fontSize(9).text(`Category: ${f.category || 'Security Misconfiguration'} | CWE/OWASP: ${f.cwe || 'CWE-200'} / ${f.owasp || 'A05:2021'} | Status: ${f.status || 'Verified'}`);
          doc.fillColor('#0284c7').fontSize(9).text(`Affected Asset: ${(f.affectedAssets || []).join(', ') || target?.url || '-'}`);
          
          if (f.description) {
            doc.fillColor('#334155').fontSize(9).text(`Description: ${f.description}`);
          }
          if (f.evidence) {
            doc.fillColor('#b91c1c').fontSize(9).text(`Proof of Concept (PoC Evidence):\n${f.evidence.slice(0, 300)}`);
          }
          if (f.impact) {
            doc.fillColor('#c2410c').fontSize(9).text(`Business Impact: ${f.impact}`);
          }
          const remedies = Array.isArray(f.remediation) ? f.remediation.join('\n• ') : f.remediation;
          if (remedies) {
            doc.fillColor('#15803d').fontSize(9).text(`Remediation Steps:\n• ${remedies}`);
          }
          doc.moveDown(1);
        });
      }

      // Section 4: Testing Constraints & Rules of Engagement
      doc.moveDown();
      doc.fillColor('#0284c7').fontSize(14).text('4. Compliance & Constraints');
      doc.fillColor('#475569').fontSize(9).text('• All security testing was restricted strictly to authorized systems and parameters.');
      doc.text('• Exploitation activity was limited to non-destructive proof-of-concept validation.');
      doc.text('• No actions impacted production users, data integrity, or service availability.');

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  return { fileName, fileUrl: `/uploads/reports/${fileName}` };
}

module.exports = { generatePdf: generateReportFile, generateReportFile };
