# Module: PDF Application Summary

**Purpose:** a downloadable PDF of an application for borrowers (steps 10 and 11, My Applications) and staff (back-office inspector).

## Files and symbols
| File | Symbols |
|---|---|
| `backend/services/pdfService.js` | `streamApplicationPdf(app, res, { includeRisk })`, `fmtDate`, `fmtMoney`, `section`, `row` |
| `backend/server.js:1111-1139` | `app.all('/api/applications/:id/pdf')` |
| `frontend/src/services/api.ts:235-268` | `downloadApplicationPdf` (POST with the full application, then GET fallback), `triggerDownload` |

## Content
Header (LendGlobal Israel, generation time) → request number, status, submitted date, language → borrower, residency, employment and loan sections → **disbursement bank account (full account number)** → guarantors → indicative eligibility → documents (type, filename, quality) → *risk section (staff only)* → status history → digital signature → signed-at.

## Known issues
- **SEC-02 (Critical):** the POST body is persisted before authorization when the id is unknown.
- **DEF-03:** the signature section checks `signatureMethod === 'draw' / 'type'` (`pdfService.js:146-166`), but the client sends `'drawn_touch' / 'typed_name'` and puts the image in `signatureDataUri` (`Step9ReviewConfirm.tsx:139-141`). As a result **every PDF shows "Typed Signature" and "Signed by —", and drawn signatures are never rendered.**
- Drawn-signature images, if they were ever matched, are passed to `doc.image` from user-supplied base64. pdfkit parses untrusted PNG/JPEG data there.
- Fonts are pdfkit Helvetica only, so **Hebrew, Thai and Chinese text will not render correctly** (Inferred: standard PDF fonts do not include these glyphs, and no custom font is registered).
- Bank account numbers appear in full. Consider masking them in borrower copies.

## Tests (existing)
`test_verification.js` §9 and `test_guarantors_and_scoring.js` (last test) check that the PDF is generated and contains the expected content. They do not check the signature rendering.
