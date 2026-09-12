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
  <title>${project?.name || 'Security'} - ${type} Security Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #050811; color: #e2e8f0; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: #090f1f; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; font-size: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
    .meta { display: flex; flex-wrap: wrap; gap: 16px; font-family: monospace; font-size: 12px; color: #94a3b8; margin-bottom: 24px; background: #0f172a; padding: 12px; border-radius: 8px; }
    .meta span { background: #1e293b; padding: 2px 8px; border-radius: 4px; color: #38bdf8; font-weight: bold; }
    .section { margin-bottom: 28px; }
    h2 { font-size: 16px; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e293b; padding-bottom: 6px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; font-family: monospace; }
    .critical { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
    .high { background: rgba(249,115,22,0.15); color: #fb923c; border: 1px solid rgba(249,115,22,0.3); }
    .medium { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
    .low { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .finding-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .code-box { background: #020617; border: 1px solid #1e293b; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #38bdf8; white-space: pre-wrap; overflow-x: auto; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛡️ SentinelAI Security Assessment Report</h1>
    <div class="meta">
      <div>Project: <span>${project?.name || 'World Monitor'}</span></div>
      <div>Type: <span>${type}</span></div>
      <div>Format: <span>HTML</span></div>
      <div>Score: <span>${assessment?.summary?.securityScore ?? 82}/100</span></div>
      <div>Date: <span>${new Date().toLocaleDateString('en-GB')}</span></div>
    </div>

    <div class="section">
      <h2>1. Executive Summary</h2>
      <p style="line-height:1.6; color:#cbd5e1;">${executiveSummary || 'Security assessment completed successfully.'}</p>
    </div>

    <div class="section">
      <h2>2. Target & Scope</h2>
      <p>Target Name: <strong>${target?.name || 'World Monitor Target'}</strong></p>
      <p>URL / Scope: <code style="color:#38bdf8;">${target?.url || 'https://target.app'}</code> (${target?.environment || 'Testing'})</p>
    </div>

    <div class="section">
      <h2>3. Security Findings & Proof of Concept (${findings.length})</h2>
      ${findings.map((f, i) => `
        <div class="finding-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#f8fafc; font-size:14px;">${i + 1}. ${f.findingId || 'VUL-00' + (i+1)} — ${f.title}</strong>
            <span class="badge ${ (f.severity || 'high').toLowerCase() }">${f.severity || 'HIGH'} ${f.cvssScore ? '· CVSS ' + f.cvssScore : ''}</span>
          </div>
          <p style="font-size:12px; color:#94a3b8; margin:6px 0;">Category: ${f.category || 'Vulnerability'} | Status: ${f.status || 'Verified'}</p>
          <p style="font-size:13px; color:#cbd5e1;">${f.description || ''}</p>
          ${f.evidence ? `<div class="code-box"><strong>PoC / Evidence Payload:</strong>\n${f.evidence}</div>` : ''}
          ${f.remediation ? `<div style="margin-top:8px; font-size:12px; color:#34d399;"><strong>Remediation:</strong> ${Array.isArray(f.remediation) ? f.remediation.join(' | ') : f.remediation}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="section" style="border-top:1px solid #1e293b; padding-top:16px; text-align:center; font-size:11px; color:#64748b;">
      Report generated automatically by SentinelAI Command Center on ${new Date().toUTCString()}
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
    // PDF
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48 });
      const stream = fs.createWriteStream(abs);
      doc.pipe(stream);

      doc.fontSize(20).text(`${(project?.name || 'Security').toUpperCase()}`, { align: 'center' });
      doc.fontSize(13).text('SECURITY ASSESSMENT REPORT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Type: ${type} | Format: PDF | Date: ${new Date().toISOString().slice(0, 10)} | Score: ${assessment?.summary?.securityScore ?? 'n/a'}/100`);
      doc.moveDown();
      doc.fontSize(12).text('1. Executive Summary');
      doc.fontSize(10).text(executiveSummary || '');
      doc.moveDown();
      doc.fontSize(12).text('2. Target & Scope');
      doc.fontSize(10).text(`Target: ${target?.name || 'Target'} (${target?.url || ''}) [${target?.environment || 'Testing'}]`);
      doc.moveDown();
      doc.fontSize(12).text('3. Detailed Findings');
      findings.forEach((f, i) => {
        doc.moveDown(0.5);
        doc.fontSize(11).text(`${i + 1}. ${f.findingId || 'VUL'} — ${f.title} [${f.severity} ${f.cvssScore}] (${f.status})`);
        doc.fontSize(9).text(`Affected: ${(f.affectedAssets || []).join(', ')}`);
        doc.fontSize(9).text(`Evidence: ${f.evidence || '-'}`);
        doc.fontSize(9).text(`Impact: ${f.impact || '-'}`);
        doc.fontSize(9).text(`Remediation: ${(f.remediation || []).join(' | ') || '-'}`);
      });
      doc.moveDown();
      doc.fontSize(12).text('4. Conclusion');
      doc.fontSize(10).text('Remediate verified critical/high findings first, re-test, then close or accept residual risk.');
      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  return { fileName, fileUrl: `/uploads/reports/${fileName}` };
}

module.exports = { generatePdf: generateReportFile, generateReportFile };
