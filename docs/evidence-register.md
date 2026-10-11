# Evidence Register

Each major claim in this documentation set, with its evidence. Paths are repository-relative, and line numbers refer to HEAD `397b7d9` (2026-10-11).

Evidence types: **Code** (read in source) · **Exec** (observed by running a command) · **Grep** (absence or presence established by search) · **Data** (read-only DB metadata query) · **Doc** (existing project documentation).

## Platform and stack

| # | Claim | Status | Type | Location / symbol | Limitations |
|---|---|---|---|---|---|
| E1 | No Flutter, React Native or native modules | Verified | Grep | `git ls-files` (68 files) | — |
| E2 | Frontend is React 19 + Vite 6 + Tailwind 4 SPA | Verified | Code | `frontend/package.json` | Installed versions may differ from the declared ranges |
| E3 | Backend is Express 5 + sqlite3, CommonJS | Verified | Code | `backend/package.json` | — |
| E4 | No CI, Docker, ESLint or test framework | Verified | Grep | repo tree | — |
| E5 | `@google/genai` and frontend `express` unused | Verified | Grep | `frontend/src` | — |
| E6 | `bun.lock` is stale | Verified | Grep/Git | no `recharts` entry. Last changed in `1a45e40` | — |
| E8 | Installed versions: backend matches declared; frontend react 19.2.8, vite 6.4.3, tailwindcss 4.3.3, typescript 5.8.3, @google/genai 2.19.0 | Verified | Exec | `node_modules/*/package.json` | Local install only; lockfile resolution not audited |
| E9 | 28 i18n keys missing per non-English language | Verified | Exec | script parse of `translations.ts` | Parser is a heuristic (4-space key indent) |
| E7 | Node v20.20.2 used for verification | Verified | Exec | `node -v` | Not a project requirement |

## Architecture

| # | Claim | Status | Type | Location / symbol | Limitations |
|---|---|---|---|---|---|
| E10 | Public routes are declared before `app.use('/api', authenticate)` | Verified | Code | `server.js:382-619` | — |
| E11 | OTP and SSE state in memory | Verified | Code | `otpStore` `server.js:160`, `sseClients` `:312` | — |
| E12 | Client writes locally first, then background PUT with errors swallowed | Verified | Code | `App.tsx:108-117, 249-265` | — |
| E13 | No router. `currentStep` state machine | Verified | Code | `App.tsx:42, 333-451` | — |
| E14 | No Redux, Zustand or Context | Verified | Grep | `frontend/src` imports | — |
| E15 | Storage seeds 3 demo apps and 2 demo users | Verified | Code | `storage.ts:31-393, 407-449` | — |
| E16 | Back-office toggle visible to all | Verified | Code | `Header.tsx:163-179` | — |
| E17 | No service worker or PWA manifest | Verified | Grep | `index.html`, `src` | — |

## API and data

| # | Claim | Status | Type | Location | Limitations |
|---|---|---|---|---|---|
| E20 | 28 API endpoints as listed | Verified | Code | `server.js:386-1286` | — |
| E21 | Risk and eligibility fields discarded from the PUT body | Verified | Code | `server.js:972-973` | — |
| E22 | Borrower immutability after submission | Verified | Code | `server.js:981-1007` | — |
| E23 | Staff PUT unrestricted | Verified | Code | `server.js:975-977` | — |
| E24 | Tables, columns and ALTER list | Verified | Code | `database.js:14-140` | — |
| E25 | Only automatic indexes exist | Verified | Data | `sqlite_master` query (8 auto indexes) | — |
| E26 | DB row counts (23 users, 34 apps, …) | Verified | Data | read-only `COUNT(*)` | Contents not read. Real or synthetic unknown |
| E27 | FK not enforced (no `PRAGMA foreign_keys`) | Verified | Grep | `database.js`, `server.js` | — |
| E28 | `users.isActive` never read | Verified | Grep | `server.js:74, 477, 535` only | — |
| E29 | Upload magic-byte check accepts any `ftyp` box | Verified | Code | `server.js:669-672` | Exploitability not tested |
| E31 | `sendFile` sets Content-Type from the file extension | Verified | Code | `send` package `mime.contentType(ext)` (installed copy) | — |
| E32 | Borrower may change `bankAccount`/`documents` after submission | Verified | Code | frozen-field list `server.js:983-984` | Not exercised over HTTP |
| E33 | PDF fallback stores boolean `isSubmitted:true` as a draft | Verified | Code | `parseApp` `server.js:175`, `api.ts:246` | Not exercised |
| E30 | File GET allowed when there is no ownership row | Verified | Code | `server.js:721-724` | — |

## Security

| # | Claim | Status | Type | Location | Limitations |
|---|---|---|---|---|---|
| E40 | DEMO_MODE default-on and its bypasses | Verified | Code | `server.js:25, 101-138, 157, 434-437, 461-465, 570, 609-614` | Not exercised against a deployed environment |
| E41 | PDF route writes before authorization | Verified | Code | `server.js:1115-1129` | Code path read, not executed |
| E42 | Client-side OTP fallback on any error | Verified | Code | `Step2Auth.tsx:401-411`, `storage.ts:690-761` | — |
| E43 | Plaintext passwords in localStorage | Verified | Code | `storage.ts:519-560, 578-590` | — |
| E44 | `apiService.logout` never called | Verified | Grep | only definition at `api.ts:159` | — |
| E45 | No rate limiting | Verified | Grep | no limiter middleware | — |
| E46 | `cors()` open, no helmet | Verified | Code | `server.js:44` | Proxy config not accessible |
| E47 | Hard-coded dev JWT secret | Verified | Code | `server.js:32` | — |
| E48 | `database.sqlite` tracked since the initial commit | Verified | Git | `git log -- backend/database.sqlite` | — |
| E49 | Consent IP hard-coded | Verified | Code | `Step9ReviewConfirm.tsx:143, 155, 164` | — |
| E50 | No XSS sinks in the frontend | Verified | Grep | `dangerouslySetInnerHTML`, `innerHTML`, `eval` absent | Library internals not reviewed |
| E52 | Borrower-facing FAQ claims encryption at rest and immutable audit logs | Verified | Code | `HelpModal.tsx` `faqs` (line 15+) | — |
| E53 | Google Fonts loaded from Google CDN | Verified | Code | `frontend/index.html:12-14` | — |
| E54 | Clipboard used once (write request number) | Verified | Grep | `Step10SubmissionSuccess.tsx:37` | — |
| E51 | Dependency vulnerabilities | **Not assessed** | — | — | `npm audit` not run |

## Financial and workflow logic

| # | Claim | Status | Type | Location | Limitations |
|---|---|---|---|---|---|
| E60 | No money movement (disbursement, repayment, ledger) | Verified | Grep/Code | no such routes, tables or integrations | — |
| E61 | Repayment formula and constants | Verified | Code | `appConfig.ts:3-22, 200-241` | — |
| E61a | Worked example ₪5,000 / 6 months gives ₪867 per month, ₪5,202 total | Verified | Exec | formula run in Node, 2026-10-11 | UI not observed |
| E61b | Age rule is a literal 21, not config | Verified | Code | `Step3BorrowerDetails.tsx:99-101` | — |
| E62 | Grace period ignored, processing fee unused | Verified | Code/Grep | `calculateLoanRepayment`. `processingFeePercent` appears only at its definition | — |
| E63 | No server validation of loan terms | Verified | Grep/Code | `server.js` PUT handler | — |
| E64 | Client request-number generation | Verified | Code | `storage.ts` `getOrCreateActiveApplication` (`nextSeq`) | — |
| E65 | Server request-number race (no transaction or UNIQUE) | Verified (design) / Suspected (occurrence) | Code | `server.js:286-291` | Concurrency not tested |
| E66 | Funding hand-off simulated | Verified | Code | `storage.ts:1233-1266`, `BackOffice.tsx:158-168` | — |
| E67 | "cryptographicDigest" is random | Verified | Code | `storage.ts:1275` | — |
| E68 | Quality and OCR simulated | Verified | Code | `Step8DocumentUpload.tsx:148-171` | — |
| E69 | Analytics placeholder KPIs | Verified | Code | `AnalyticsDashboard.tsx:114-119` | — |
| E70 | Eligibility mirror thresholds identical | Verified | Exec | diff of numeric literals, JS vs TS | Logic structure compared visually, not by test |
| E71 | Credit engine rules and defaults | Verified | Code | `creditEngine.js:7-101` | — |
| E72 | Back-office actions ignore the current status | Verified | Code | `BackOffice.tsx:995-1080` | — |

## Quality

| # | Claim | Status | Type | Location | Limitations |
|---|---|---|---|---|---|
| E80 | Test results 32/32, 42/45, 8/8 | Verified | Exec | scratch copy of `backend/`, 2026-10-11 | Date-dependent |
| E81 | 3 failures caused by the fixture date | Verified | Exec/Code | `test_guarantors_and_scoring.js:582, 624, 667` | — |
| E82 | `tsc --noEmit` fails with 4 errors | Verified | Exec | output in [testing-and-qa.md](testing-and-qa.md) | — |
| E83 | `vite build` succeeds | Verified | Exec | — | — |
| E84 | Steps 7 and 8 crash at runtime | Verified (source + bundle) | Code/Exec | missing `useEffect` import. 3 unbound `useEffect(` references in the built bundle | Crash not observed in a browser |
| E85 | PDF signature mismatch | Verified | Code | `pdfService.js:146-166` vs `Step9ReviewConfirm.tsx:139-141` | PDF output not visually inspected |
| E86 | Back-office status change fails without a local copy | Suspected | Code | `BackOffice.tsx:132-146`, `storage.ts:1114` | Not executed |

## Not accessible or not verifiable
- Any deployed environment, its configuration, proxy, TLS and logs.
- Twilio and SMTP account configuration and delivery behaviour.
- Whether DB contents are real personal data.
- Legal and regulatory applicability.
- Visual and UX fidelity against `design/*.png`.

## Side effects of this review
- No application code, configuration or schema was modified.
- Tests were run in a scratch copy, so the tracked `database.sqlite` is unchanged.
- `npx vite build` wrote `frontend/dist/` (gitignored build output).
- Only the `docs/` directory was added to the repository.
