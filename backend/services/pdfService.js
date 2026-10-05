const PDFDocument = require('pdfkit');

const BRAND = '#1e3a8a';
const MUTED = '#64748b';

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 10);
}

function fmtMoney(value) {
  if (value === undefined || value === null || value === '') return '—';
  return `NIS ${Number(value).toLocaleString('en-US')}`;
}

/**
 * Stream a formatted PDF summary of a loan application to an HTTP response.
 * @param {Object} app              Parsed application object
 * @param {import('express').Response} res
 * @param {{ includeRisk?: boolean }} options  Risk data is only shown to staff
 */
function streamApplicationPdf(app, res, options = {}) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Loan Application ${app.requestNumber || app.id}` } });
  const filename = `${(app.requestNumber || app.id).replace(/[^A-Za-z0-9_-]/g, '_')}.pdf`;

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }
  doc.pipe(res);

  // Header band
  doc.rect(0, 0, doc.page.width, 80).fill(BRAND);
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('LendGlobal Israel', 50, 24);
  doc.fontSize(10).font('Helvetica').text('Loan Application Summary', 50, 50);
  doc.fontSize(10).text(`Generated ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`, 0, 50, { align: 'right', width: doc.page.width - 50 });

  doc.moveDown(3);
  doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text(app.requestNumber || app.id, 50, 100);
  doc.fontSize(11).font('Helvetica').fillColor(MUTED)
    .text(`Status: ${app.status || '—'}    Submitted: ${fmtDate(app.submittedAt)}    Language: ${(app.language || 'en').toUpperCase()}`);
  doc.moveDown(0.8);

  const section = (title) => {
    if (doc.y > doc.page.height - 140) doc.addPage();
    doc.moveDown(0.6);
    doc.fillColor(BRAND).fontSize(12).font('Helvetica-Bold').text(title.toUpperCase());
    const y = doc.y + 2;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#cbd5e1').lineWidth(0.7).stroke();
    doc.moveDown(0.5);
  };

  const row = (label, value) => {
    if (doc.y > doc.page.height - 70) doc.addPage();
    const y = doc.y;
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text(label, 50, y, { width: 170 });
    doc.fillColor('#0f172a').font('Helvetica-Bold').text(value === undefined || value === null || value === '' ? '—' : String(value), 225, y, { width: doc.page.width - 275 });
    doc.moveDown(0.25);
  };

  const b = app.borrowerDetails || {};
  section('Borrower');
  row('Full name', b.fullName);
  row('Passport number', b.passportNumber);
  row('Country of origin', b.countryOfOrigin);
  row('Date of birth', b.dateOfBirth);
  row('Mobile phone', b.mobilePhoneNumber);
  row('Address', b.addressFull || [b.addressStreet, b.addressCity].filter(Boolean).join(', '));
  row('Marital status', b.maritalStatus);

  const r = app.residencyDetails || {};
  section('Residency');
  row('Visa type', r.visaType);
  row('Visa expiry', r.visaExpiryDate);
  row('Date of entry', r.dateOfEntry);
  row('Years in Israel', r.yearsOfResidency);

  const e = app.employmentDetails || {};
  section('Employment');
  row('Employer', e.employerName);
  row('Staffing agency', e.staffingAgencyName);
  row('Job tenure (months)', e.jobTenureMonths);
  row('Monthly salary', fmtMoney(e.monthlySalaryNis));
  row('Salary payment method', e.salaryPaymentMethod);

  const l = app.loanRequest || {};
  section('Loan Request');
  row('Requested amount', fmtMoney(l.requestedAmountNis));
  row('Purpose', l.loanPurpose === 'Other' && l.otherPurposeDetails ? `Other — ${l.otherPurposeDetails}` : l.loanPurpose);
  row('Repayment period', l.repaymentPeriodMonths ? `${l.repaymentPeriodMonths} months` : undefined);
  row('Estimated monthly payment', fmtMoney(l.estimatedMonthlyPaymentNis));
  row('Total repayment', fmtMoney(l.totalRepaymentNis));
  row('Repayment source', l.repaymentSource);

  const bAccount = app.bankAccount || {};
  section('Disbursement Bank Account');
  if (bAccount.bankName || bAccount.accountNumber) {
    row('Bank name', bAccount.bankName);
    row('Branch number', bAccount.branchNumber);
    row('Account number', bAccount.accountNumber);
    row('Account holder', bAccount.accountHolderName);
  } else {
    row('Bank account', app.bankAccountConfirmed ? 'Confirmed Israeli Bank Account' : 'Pending verification');
  }

  const g = app.guarantor || {};
  section('Guarantor');
  if (g.hasGuarantor) {
    row('Full name', g.fullName);
    row('Passport / ID', g.passportOrIdNumber);
    row('Mobile phone', g.mobilePhoneNumber);
    row('Relationship', g.relationship);
  } else {
    row('Guarantor', 'None provided');
  }

  section(`Documents (${(app.documents || []).length})`);
  if ((app.documents || []).length === 0) {
    row('Documents', 'None uploaded');
  } else {
    (app.documents || []).forEach((d) => row(d.documentTypeCode, `${d.originalFilename} · ${d.qualityStatus || 'n/a'}`));
  }

  if (options.includeRisk && app.riskLevel) {
    section('Automated Pre-Screening (advisory)');
    row('Risk level', `${app.riskLevel} (score ${app.riskScore ?? '—'}/100)`);
    (app.riskFlags || []).forEach((f) => row('Flag', f));
  }

  section('Status History');
  const history = app.statusHistory || [];
  if (history.length === 0) {
    row('History', 'No status changes recorded');
  } else {
    history.forEach((h) => row(fmtDate(h.createdAt), `${h.toStatus}${h.reason ? ` — ${h.reason}` : ''}`));
  }

  const sig = app.digitalSignature;
  section('Digital Signature');
  row('Method', sig?.signatureMethod ? (sig.signatureMethod === 'draw' ? 'Drawn Signature' : 'Typed Signature') : '—');
  
  if (sig && sig.signatureMethod === 'type') {
    row('Signed by', sig.signatureValue || '—');
  } else if (sig && sig.signatureMethod === 'draw' && sig.signatureValue) {
    if (typeof sig.signatureValue === 'string' && sig.signatureValue.startsWith('data:image')) {
      try {
        const base64Data = sig.signatureValue.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        const y = doc.y;
        doc.fillColor(MUTED).fontSize(10).font('Helvetica').text('Signature', 50, y, { width: 170 });
        doc.image(imgBuffer, 225, y, { fit: [140, 40] });
        doc.y = y + 45;
      } catch (e) {
        row('Signature', '[Drawn signature on file]');
      }
    } else {
      row('Signature', '[Drawn signature on file]');
    }
  } else {
    row('Signed by', '—');
  }

  let formattedDate = '—';
  if (sig && sig.signedAt) {
    try {
      const d = new Date(sig.signedAt);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
      }
    } catch {}
  }
  row('Signed at', formattedDate);

  doc.end();
}

module.exports = { streamApplicationPdf };
