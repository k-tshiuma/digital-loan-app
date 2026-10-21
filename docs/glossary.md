# Glossary

| Term | Meaning in this codebase |
|---|---|
| **QuickLoan / LendGlobal** | The same product. "QuickLoan" is used in CLAUDE.md, localStorage keys and the email sender. "LendGlobal" is used in the UI, SMS, PDF, `index.html` and `metadata.json` |
| **Application** | A `LoanApplication` record: the aggregate root holding all borrower sections, documents, consents, signature and status history |
| **Draft** | An application with `isSubmitted = false`. Its status is forced to `Received` on the server |
| **Request number** | Human-readable `REQ-<year>-<6 digits>` identifier. Assigned by the client first and possibly replaced by the server (FIN-02) |
| **Canonical status** | One of: Received, Under Review, Additional Document Required, Approved, Rejected, Forwarded to Funding Entity |
| **Returning user** | A borrower with saved profile data or a prior submitted application. Their new drafts are prefilled and start at step 6 |
| **profileData** | JSON copy of the latest application's sections, kept on `users` for prefill |
| **Eligibility score** | A 0–100 indicative score from 5 factors × 20 (`services/eligibilityScoring.js`, mirrored in the frontend). Shown to borrowers |
| **Risk score / pre-screen** | A 0–100 advisory score plus Low/Medium/High plus flags from `creditEngine.js`. Staff only. Never blocks a submission |
| **Credit rules** | Configurable thresholds of the risk engine, stored in `app_config.creditRules` |
| **Guarantor** | A third party backing the loan. `guarantors[]` (1–3) is current. `guarantor` is the legacy single object kept in sync |
| **DEMO_MODE** | Backend switch, **on by default** outside production, that enables fixed OTPs, staff role tokens, mock Google login, codes echoed in responses and an anonymous `demo_user` (SEC-01) |
| **demo_user** | The synthetic borrower identity assigned to unauthenticated requests in DEMO_MODE |
| **Staff roles** | `customer_service`, `credit_reviewer`, `system_admin`, `funding_entity` |
| **Back office** | The staff console (`BackOffice.tsx`), toggled from the header |
| **storageService** | The frontend localStorage "shadow backend" (`services/storage.ts`) |
| **apiService** | The frontend HTTP client (`services/api.ts`) |
| **SSE** | Server-Sent Events. One-way live updates from `GET /applications/:id/events` |
| **Funding hand-off** | Moving an approved application to the funding partner. **Simulated** in the browser |
| **Magic bytes** | Leading bytes of a file used to check its real type on upload |
| **NIS / ₪** | New Israeli Shekel. All amounts are whole shekels, implied by `*Nis` field names |
| **Visa types** | Israeli foreign-worker visa categories (e.g. B/1), configured in `VISA_TYPES` (`appConfig.ts:71`) |
| **OTP** | One-time password: a 6-digit SMS code |
| **IDOR** | Insecure Direct Object Reference: accessing another user's object by changing an id |
| **Verified / Inferred / Suspected / Unverified / Not Implemented / Not Accessible** | Evidence status labels. See [README.md](README.md#verification-status-legend) |
