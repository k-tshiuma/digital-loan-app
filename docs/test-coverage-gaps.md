# Test Coverage Gaps (proposed tests)

Everything in this document is **proposed**. None of these tests exist yet. No coverage percentage is claimed because no coverage tooling is configured.

## Priority 0: guard the critical findings

| ID | Test | Expected | Finding |
|---|---|---|---|
| G-01 | Start the server with `NODE_ENV` unset and `DEMO_MODE` unset; call a protected route with no token or a token with a bad signature | 401 (after the fix) | SEC-01 |
| G-02 | POST `/applications/<new-id>/pdf` with an application body | No row created; 404 | SEC-02 |
| G-03 | `customer_service` / `funding_entity` token PUTs `status: 'Approved'` | 403 | SEC-03 |
| G-04 | Staff PUT moves `Rejected → Approved` or `Received → Forwarded` | 400 (invalid transition) | SEC-03 |
| G-05 | Frontend: verify-OTP API returns 400 → the UI must **not** authenticate | Error shown, no session | SEC-05 |
| G-06 | Frontend: sign out → `quickloan_auth_token` and all `quickloan_*` keys removed | Cleared | SEC-07 |
| G-07 | Render Step 7 and Step 8 (component smoke test) | No ReferenceError | DEF-01 |
| G-08 | `tsc --noEmit` in CI | Passes | DEF-01, DEF-02 |

## Authentication and session
- OTP expiry after 5 minutes (inject a clock). 429 after 5 wrong codes. A new code invalidates the old one.
- Reset-password: expiry, single use, attempt limit, generic response for an unknown identifier.
- Login with an expired JWT → 401. Tampered JWT → 401. Token with `alg: none` → 401.
- `register` with a token for a different phone → 403.
- Rate limiting (after it is introduced): N+1 OTP requests per phone or IP → 429.

## API failures, timeouts and network interruptions
- Submission when the API returns 500, times out, or the network drops → no success screen and a retry offered (FIN-01).
- Draft save failure → a visible "not synced" state.
- SSE disconnect and reconnect → state refreshed after reconnecting.

## Financial calculations and rounding
- Golden values for `calculateLoanRepayment` over all amount × period combinations, including grace periods and fees once implemented (FIN-03).
- A shared JSON fixture of eligibility cases run by **both** `eligibilityScoring.js` and `eligibilityScoring.ts` (mirror drift).
- `creditEngine.runCreditScreening` unit tests at each threshold, plus `normalizeRules` rejecting invalid values.

## Duplicate and concurrent operations
- Two parallel first-submissions → distinct request numbers, enforced by a UNIQUE index (FIN-05).
- Double-click submit → one submission (idempotency key).
- Stale staff PUT (an older `updatedAt` or version) → 409 (FIN-06).
- Credit-rule update during submissions → consistent scoring (FIN-13).

## Pending and ambiguous results
- Response lost after a successful submission → the client reconciles with the server (GET by id) and shows the server's request number.

## Server-side business validation (after FIN-04 is implemented)
- Amount < 500, > 10,000, or not a multiple of 500 → 400. Period ∉ {3,6,9,12} → 400. Age < 21 → 400. Visa < 6 months → 400. Missing required documents → 400. Missing consents → 400.
- Resubmission without a new owned upload → 400 (FIN-10).

## Authorization and IDOR
- Borrower B GET, PUT, SSE, PDF and notifications for borrower A's resources → 403 (partly covered today in `test_returning_user_prefill.js` §5).
- File with no `uploaded_files` row → 403 after the fix (SEC-10).
- A borrower PUT with `status: 'Approved'` on their own submitted app → status unchanged (covered implicitly; add an explicit test).

## Sensitive data handling
- `GET /users/me` never returns `password`. Borrower responses never contain `riskScore`, `riskLevel` or `riskFlags`.
- Logs contain no OTP or reset codes outside development.
- The PDF for a borrower omits the risk section (and masks the bank account, if adopted).
- Upload served with a safe Content-Type and `attachment` (SEC-10).

## Platform and browser
- RTL layout snapshot for Hebrew. Translation-key completeness test (every key present in all 5 languages).
- Camera capture input on iOS Safari and Android Chrome (manual).
- localStorage unavailable (private mode) → app degrades gracefully.

## Test infrastructure recommendations
1. Configurable DB path plus a temp DB per test run, with teardown.
2. Adopt `node:test` (built in) or Jest for the backend, and Vitest with React Testing Library for the frontend.
3. Playwright E2E for the happy path: language → OTP → steps 3–9 → submit → staff approve → borrower sees the SSE update.
4. CI pipeline: install, `tsc --noEmit`, backend tests, frontend tests, `npm audit`.
