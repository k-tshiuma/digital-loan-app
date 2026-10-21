# Module: Loan Application Wizard

**Purpose:** collect a complete loan application across steps 3–9, persist drafts, prefill data for returning borrowers, submit, and show confirmation.

## Files and symbols
| Layer | File | Symbols |
|---|---|---|
| Orchestration | `frontend/src/App.tsx` | `currentStep`, `autoSaveDraft`, `handleSave*` per step, `handleSubmitApplication`, `handleStartNewApplication`, returning-user modal wiring |
| Steps | `Step3BorrowerDetails`, `Step4ResidencyDetails`, `Step5EmploymentDetails`, `Step6LoanDetails`, `Step9ReviewConfirm`, `Step10SubmissionSuccess` | `onSaveAndNext`, `onBack` |
| Progress | `WizardProgress.tsx`, `EligibilityScoreBar.tsx` | |
| Prefill UI | `ReturningUserConfirmModal.tsx` | `onConfirmEverything`, `onUpdateDetails` |
| Config | `config/appConfig.ts` | `DEFAULT_APP_CONFIG`, `calculateLoanRepayment`, `calculateAge`, `isVisaValidForLoan`, option lists |
| Local data | `services/storage.ts` | `getOrCreateActiveApplication`, `saveApplication`, `submitApplication`, `checkDuplicateOpenApplication`, `evaluateReusableDocuments` |
| Server | `backend/server.js` | `GET /applications/active/:userId` (`:795`), `PUT /applications/:id` (`:960`), `evaluateReusableDocuments` (`:737`), `writeApp`, `nextRequestNumber` |

## Validation by step (client-side only unless stated otherwise)
| Step | Rules | Server enforced? |
|---|---|---|
| 3 | Required fields. Age ≥ 21 (`calculateAge`, compared with a **literal** `21`, not `minBorrowerAge`, `Step3BorrowerDetails.tsx:99-101`). Passport not used by another open local application | No |
| 4 | Visa expiry at least 6 months away (`isVisaValidForLoan(…, 6)`) | No (affects risk and eligibility scores only) |
| 5 | Employer, salary, tenure | No |
| 6 | Amount slider 500–10,000 step 500 (the typed input is **not** clamped). Period 3/6/9/12. Bank branch, account and holder required | No |
| 7 | 1–3 guarantors. Name, ID and phone required | No |
| 8 | Required documents uploaded | No |
| 9 | Consents and signature | No |

## Returning-user behaviour
1. The server finds `users.profileData`, the latest submitted application, or the latest application with borrower details (`server.js:799-821`).
2. A new draft starts at **step 6** with the sections copied and documents reused when still valid. Pay slips older than 90 days and visas with less than 6 months left are dropped. The report comes back as `previousDocumentsReport`.
3. `ReturningUserConfirmModal` asks the borrower to confirm, or to update the passport number, employer, salary and bank details. It then sets `detailsConfirmedAt` and moves to step 6.
4. From step 6, Back goes to step 3 for returning users (`App.tsx:391`).

## Submission
See [financial-workflows.md W4](../financial-workflows.md#w4-submission-pre-screen-and-eligibility-scoring). Key caveat: **success is shown before the server confirms** (FIN-01).

## Error states and edge cases
- Background save failures are invisible.
- "Start new application" removes `quickloan_active_app_id` and creates a new local draft. The server will create or return its own draft on the next `/active` call.
- `MyApplications` selection replaces the active application locally (`App.tsx:488-501`).

## Tests (existing)
`test_verification.js` §1, §5, §6, §8. `test_returning_user_prefill.js` §1–§4 (prefill, edits, document replacement).

## Known issues
FIN-01, FIN-02, FIN-03, FIN-04, FIN-12, FIN-14, FIN-17 (bank account and documents stay editable after submission). DEF-01 (steps 7 and 8 crash at runtime because `useEffect` is not imported).

## Extending safely
- Add a step: create `StepN*.tsx`, add a `handleSave*` in `App.tsx` that calls `autoSaveDraft(updated, nextStep)`, renumber the later steps (`currentStep` literals appear throughout `App.tsx` and `WizardProgress`), add translations in **all 5** languages, and add the field to `types.ts` (`LoanApplication`). Because `writeApp` writes a fixed column list, **a new top-level field will not persist unless you also add a column** in `database.js` and `writeApp` (`server.js:261-277`), or nest it inside an existing JSON section.
- Any new business rule must be implemented **on the server** too (see FIN-04).
