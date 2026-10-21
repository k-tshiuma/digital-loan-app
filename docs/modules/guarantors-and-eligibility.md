# Module: Guarantors and Indicative Eligibility Score

**Purpose:** collect 1–3 guarantors and compute a 0–100 **indicative** eligibility score that is shown to the borrower (`EligibilityScoreBar`) and stored with the application.

## Files and symbols
| Layer | File | Symbols |
|---|---|---|
| UI | `Step7Guarantor.tsx` | Guarantor list (min 1, max 3: `:53`, `:128`, `:143`), validation (`:288-294`) |
| UI | `EligibilityScoreBar.tsx` | 10-segment bar |
| Engine (server, authoritative) | `backend/services/eligibilityScoring.js` | `calculateEligibilityScore`, `calculateVisaMonthsRemaining`, `calculateMonthsBetween`, `calculateEmploymentDurationMonths`, `extractGuarantors`, `calculateSectionsCompleted` |
| Engine (client mirror) | `frontend/src/services/eligibilityScoring.ts` | `calculateIndicativeEligibility`, `extractValidGuarantors` (renamed), same helpers |
| Sync | `server.js` `parseApp` / `writeApp` | `guarantors[0]` ↔ legacy `guarantor` |

## Scoring factors (20 points each, total = sum, clamped 0–100)
| Factor | Rule |
|---|---|
| Identity | 20 if (a non-failed PASSPORT document **or** a passport-number string) **and** a valid visa (not expired, no failed visa document, `visaType` set). Otherwise 0 |
| Salary | ≥ 7,500 NIS → 20. > 0 → 10. Otherwise 0 |
| Employment duration | Months from `startDate`/`employmentStartDate`, else `dateOfEntry`, else `yearsOfResidency×12`, else `jobTenureMonths`. ≤12 → 5, ≤24 → 10, ≤36 → 15, >36 → 20. No data → 0 |
| Visa validity | Months remaining = days / 30.4375, rounded to 0.1. ≥12 → 20, ≥6 → 10, ≥3 → 5. Otherwise 0 |
| Guarantors | Valid = has a name **and** an ID. ≥2 → 20, 1 → 10, 0 → 0 |

`segmentsFilled = floor(score / 10)` (10 at 100).

## Mirror sync status
Thresholds and point values were compared between the JS and TS files on 2026-10-11 and are **identical** (Verified by diffing the numeric literals). Function names differ (`extractGuarantors` vs `extractValidGuarantors`). **Any change must be made in both files** (CLAUDE.md requirement). A shared golden-value test would catch drift. None exists yet.

## Server authority
- `PUT /applications/:id` drops any client `eligibilityScore`/`eligibilityBreakdown` (`server.js:973`), and `writeApp` recomputes them (`:256-259`).
- **Caveat (FIN-09):** the inputs come from the client, including document `qualityStatus`/`validityStatus`. "Authoritative" means "computed on the server", not "verified".

## Relation to the credit pre-screen
This is a different system from `creditEngine.js` (see [credit-prescreening.md](credit-prescreening.md)). The credit engine gives +10 for *any* guarantor (`guarantor.hasGuarantor`). The eligibility score uses the count of valid guarantors.

## Tests (existing)
`test_guarantors_and_scoring.js` §1–§7: unit tests of boundaries with a fixed `referenceDate`. §8: HTTP tests (score tampering blocked, 1/2/3 guarantors, PDF lists guarantors).
⚠ **3 of 45 currently fail** because the HTTP fixtures hard-code `visaExpiryDate: '2027-10-08'`, which is now less than 12 months away (DEF-06). This is a test defect, not an engine defect.

## Extending safely
1. Change `backend/services/eligibilityScoring.js` and `frontend/src/services/eligibilityScoring.ts` together.
2. Update the boundary tests. Use `referenceDate` and dates relative to "now" for HTTP fixtures.
3. Remember that `parseApp` computes the score **on read** when the stored value is null, so old rows will show new scores.
