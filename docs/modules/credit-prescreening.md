# Module: Credit Pre-Screening (Risk Engine)

**Purpose:** give every submitted application an **advisory** risk score (0–100), a level (Low, Medium or High) and flags for reviewers. It never blocks a submission.

## Files and symbols
| File | Symbols |
|---|---|
| `backend/creditEngine.js` | `DEFAULT_CREDIT_RULES`, `normalizeRules`, `runCreditScreening` |
| `backend/server.js` | `getCreditRules` (`:296`), `applyRiskScore` (`:301`), call site in PUT (`:1035`), `GET/PUT /config/credit-rules` (`:1260-1286`) |
| `backend/database.js` | `app_config` table, risk columns |
| `frontend/src/components/BackOffice.tsx` | Risk badges, Credit Policy form, `handleSaveConfig` (`:193+`) |
| `frontend/src/types.ts:324` | `CreditRules` |

## Rules (defaults)
| Rule | Logic | Penalty / bonus |
|---|---|---|
| Salary coverage | `salary × salaryMultiplier(6) / amount` < 1 → FAIL. < `salaryWarnRatio`(1.5) → WARN. Missing data → `DATA_MISSING` | −40 / −15 / −40 |
| Visa | Expiry < now + term + `visaBufferMonths`(3), or invalid date | −25 |
| Tenure | `jobTenureMonths` < `hardMinTenureMonths`(3) → FAIL. < `minTenureMonths`(6) → WARN | −20 / −10 |
| Guarantor | `guarantor.hasGuarantor` | +10 |
| Level | Score ≥ `lowRiskMinScore`(80) → Low. ≥ `mediumRiskMinScore`(50) → Medium. Otherwise High | |

Flags are strings such as `SALARY_RATIO_FAIL: …`, `VISA_EXPIRY_RISK: …`, `TENURE_WARN: …`.

## Behaviour
- Runs on **every** PUT of a submitted application, so status changes re-score with the current rules.
- `PUT /config/credit-rules` (system_admin): merges, coerces values to numbers, checks two ordering constraints, persists, then re-scores all submitted applications in a loop (not atomic, FIN-13).
- Risk fields are hidden from borrowers in all API responses and in the PDF.
- `normalizeRules` accepts any finite number. Negative penalties or a `salaryMultiplier` of 0 are not rejected.

## Known issues
- There is no record of which rules version produced a given score (FIN-13).
- Tenure uses only `jobTenureMonths`, whereas the eligibility engine also derives duration from start or entry dates, so the two engines can disagree.
- The back-office Credit Policy form exposes only 7 of the 13 rules: `salaryMultiplier`, `salaryWarnRatio`, `visaBufferMonths`, `minTenureMonths`, `guarantorBonus`, `lowRiskMinScore`, `mediumRiskMinScore`. The four penalties, `visaPenalty` and `hardMinTenureMonths` can only be changed through the API. The form starts from hard-coded defaults (`BackOffice.tsx:63-72`) until the API responds.

## Tests (existing)
None target `creditEngine.js` directly. The HTTP tests submit applications, which runs the engine as a side effect.
