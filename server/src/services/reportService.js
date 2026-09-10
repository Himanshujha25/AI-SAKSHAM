const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Generates a professional PDF report on disk, returns { fileName, fileUrl }.
// fileUrl is a relative URL served by express.static('/uploads').
async function generatePdf({ project, target, assessment, findings, type, executiveSummary }) {
  const dir = path.join(__dirname, '..', '..', 'uploads', 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = Date.now();
  const fileName = `report-${assessment._id}-${stamp}.pdf`;
  const abs = path.join(dir, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const stream = fs.createWriteStream(abs);
    doc.pipe(stream);

    doc.fontSize(20).text(`${(project.name || 'Security').toUpperCase()}`, { align: 'center' });
    doc.fontSize(13).text('SECURITY ASSESSMENT REPORT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Type: ${type} | Date: ${new Date().toISOString().slice(0, 10)} | Score: ${assessment.summary?.securityScore ?? 'n/a'}/100`);
    doc.moveDown();
    doc.fontSize(12).text('1. Executive Summary');
    doc.fontSize(10).text(executiveSummary || '');
    doc.moveDown();
    doc.fontSize(12).text('2. Target & Scope');
    doc.fontSize(10).text(`Target: ${target.name} (${target.url}) [${target.environment}] Auth confirmed: ${target.authorizationConfirmed}`);
    doc.moveDown();
    doc.fontSize(12).text('3. Detailed Findings');
    findings.forEach((f, i) => {
      doc.moveDown(0.5);
      doc.fontSize(11).text(`${i + 1}. ${f.findingId} — ${f.title} [${f.severity} ${f.cvssScore}] (${f.status})`);
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

  return { fileName, fileUrl: `/uploads/reports/${fileName}` };
}

module.exports = { generatePdf };
