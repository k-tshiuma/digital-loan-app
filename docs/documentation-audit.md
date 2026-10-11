# Documentation Accuracy Audit

**Date:** 2026-10-11 · **Subject:** the `docs/` package generated earlier the same day · **Baseline:** branch `feature/guarantor-enhancements-and-scoring`, HEAD `397b7d9` (application code unchanged between generation and audit)

The audit re-checked the documentation against source, configuration, schema, tests, the built bundle and installed dependencies. Corrections were applied to the documentation only. No application code, configuration or schema was modified.

## 1. Method

| Check | How | Result |
|---|---|---|
| Citation existence | Script: every `file:line` reference in `docs/` resolved against `git ls-files`, with the line number checked against the file length | 654 references checked. 0 broken. 13 flags were all intentional (example code, mentions of files that do not exist, generic `package.json`) |
| Citation content | Printed the source line behind each of 237 unique single-line citations and reviewed it against the claim it supports | **3 wrong line numbers** (AUD-12). All other cited lines contain the claimed code |
| Claim re-verification | Targeted greps and reads for claims originally made without running a command, plus every security and financial assertion | See §3 |
| Arithmetic | Re-ran the repayment formula in Node | **1 wrong worked example** (AUD-03) |
| Build artefact | Searched the production bundle for unbound identifiers | DEF-01 confirmed in the bundle (AUD-11) |
| Library behaviour | Read the installed `send` source for Content-Type handling | Confirmed (AUD-15) |
| Completeness | Listed components and integrations not covered by any doc | 3 gaps (AUD-09, AUD-10) |
| Sensitive data | Grepped docs for secrets, phone numbers and upload identifiers | 1 item (AUD-17) |
| Machine-readable spec | Parsed `openapi.yaml` and resolved `$ref`s | Valid (re-run after edits, see §5) |
| Links | Resolved every relative link and anchor | Re-run after edits, see §5 |

## 2. Summary

| Priority | Count | Nature |
|---|---|---|
| **P1** (material: missing or incorrect security or financial statements) | 6 | AUD-01 … AUD-06 |
| **P2** (incorrect technical facts or missing coverage) | 7 | AUD-07 … AUD-13 |
| **P3** (precision, evidence labelling, hygiene) | 8 | AUD-14 … AUD-21 |

Overall: the structure, endpoint inventory (28 endpoints), schema description, auth model and nearly all citations were **accurate**. The defects were concentrated in (a) two **material findings the original review missed**, (b) one **fabricated calculation**, (c) one **claim of a search that was never run**, and (d) a few severity and precision problems.

## 3. Findings

### P1: material

| ID | Category | Finding | Evidence | Correction applied | Re-verified |
|---|---|---|---|---|---|
| AUD-01 | Missing security/financial finding | The docs said borrowers cannot change submitted applications, but the frozen-field list omits `bankAccount`, `bankAccountConfirmed` and `documents`. So a borrower session can **silently change the disbursement account after approval**, which no doc mentioned | `backend/server.js:983-984` | Added **FIN-17** (High) to `financial-integrity-risks.md`, `technical-debt.md`, the W4 table in `financial-workflows.md`, the wizard module and the evidence register (E32). The api-reference §18 already listed these fields as "remain editable" but did not flag the risk | Yes: frozen list re-read |
| AUD-02 | Missing finding / unsupported product claims | The borrower-facing FAQ claims encryption at rest, TLS 1.3, masked card numbers and "immutable audit logs record every access". The back office labels a tab "Immutable Audit Logs". The code contradicts these claims. The FAQ document checklist does not match the required documents. The docs mentioned only the footer TLS text | `frontend/src/components/HelpModal.tsx` (`faqs`, line 15+), `BackOffice.tsx` audit tab, `storage.ts:1169-1184`, `appConfig.ts:113+` | Added **SEC-21** to `security-and-privacy.md` and `technical-debt.md`. Back-office module updated. New module doc `application-history-and-help.md` | Yes: FAQ text read |
| AUD-03 | Fabricated calculation | The worked repayment example stated P&I 855, monthly ₪868, total ₪5,208, interest ₪128. Running the documented formula gives **854 / ₪867 / ₪5,202 / ₪122**. The original figures were never computed | `frontend/src/config/appConfig.ts:200-241`. Node run | `financial-workflows.md` W3 corrected and labelled with how it was computed. Evidence E61a | Yes: recomputed |
| AUD-04 | Claimed verification that was never performed | `security-and-privacy.md` §4 said "No clipboard API usage found by grep". No such grep had been run, and clipboard **is** used | `Step10SubmissionSuccess.tsx:37` | Row rewritten with the actual usage. Evidence E54 | Yes: grep run |
| AUD-05 | Imprecise security description | SEC-02 said attackers could set an "arbitrary `isSubmitted`". In fact `parseApp` maps a boolean `true` to `false` (`=== 1`). The precise effect: an arbitrary `userId`, `status`, `requestNumber`, risk fields and history are persisted before the 403, and the legitimate client fallback stores submitted applications **as drafts** | `server.js:175, 1115-1129`, `api.ts:246` | SEC-02 text corrected. Evidence E33 | Yes |
| AUD-06 | Overstated financial-risk severity | FIN-02 (request-number divergence) was rated High and described as general. Online, the client adopts the server's draft and number, so divergence happens only when `/active` fails or on a clash. The residual defect is that Step 10 ignores the PUT response | `App.tsx:88-103, 262-264`, `server.js:887, 1026-1032` | FIN-02 restated, downgraded to **Medium**, status "Verified (mechanism) / Suspected (frequency)". Technical-debt row updated | Yes |

### P2: incorrect facts and coverage gaps

| ID | Category | Finding | Evidence | Correction | Re-verified |
|---|---|---|---|---|---|
| AUD-07 | Incorrect business-rule source | The docs said Step 3 validates "age ≥ `minBorrowerAge`". The code compares against a literal `21`, and the config value is unused | `Step3BorrowerDetails.tsx:99-101` | `financial-workflows.md` W2, `data-models.md` §3, wizard module. New MNT-15 | Yes |
| AUD-08 | Incorrect diagram | The architecture component diagram showed Step 6 using `EligibilityScoreBar` and omitted Steps 10 and 11 and the back office | grep: used by Step7, Step8, Step9, Step10, Step11, BackOffice | `architecture.md` §4 diagram corrected | Yes |
| AUD-09 | Undocumented integration | Google Fonts (third-party requests that expose the visitor's IP) and the AI Studio manifest capability were missing | `frontend/index.html:12-14`, `frontend/metadata.json` | `integrations.md` table plus a new Google Fonts section. Evidence E53 | Yes |
| AUD-10 | Missing modules | No docs for My Applications (history), Help/FAQ or i18n. Also undocumented: the plan's "read-only history view" is not implemented, and 28 translation keys are missing per language | `MyApplications.tsx:41-57, 65-75`, `HelpModal.tsx`, `translations.ts` (script parse) | New `modules/application-history-and-help.md` and `modules/i18n-and-localisation.md`. MNT-14. Evidence E9 | Yes |
| AUD-11 | Under-evidenced defect | DEF-01 (Steps 7 and 8 crash) was labelled Inferred. The bundle contains exactly 3 unbound `useEffect(` calls, matching the 3 broken call sites | `frontend/dist/assets/index-*.js`. `tsc` output | Status raised to "Verified (source + bundle)" in `testing-and-qa.md`, `technical-debt.md` and the evidence register (E84). It still notes the crash was not observed in a browser | Yes |
| AUD-12 | Wrong line numbers | `Step11StatusTimeline.tsx:131` (should be **133**, `qualityStatus`); `Step11StatusTimeline.tsx:126` (should be **130**, `storageKey`). The second error was briefly mis-corrected to 127 during the audit, then fixed | source | `financial-integrity-risks.md`, `database.md`, `integrations.md` | Yes: lines re-read |
| AUD-13 | Wrong test location | The test failures were described as being in "§7/§8". They are all in §8, the HTTP tests from line 518 | `test_guarantors_and_scoring.js:518+, 582, 624, 667` | `testing-and-qa.md` | Yes |

### P3: precision and hygiene

| ID | Category | Finding | Correction | Re-verified |
|---|---|---|---|---|
| AUD-14 | Versions | The inventory listed declared ranges only. Installed frontend versions differ (react 19.2.8, vite 6.4.3, tailwindcss 4.3.3, typescript 5.8.3, @google/genai 2.19.0) | Installed versions added to `project-inventory.md`. Evidence E8 | Yes |
| AUD-15 | Library-behaviour claim not evidenced | SEC-10's "Content-Type from extension" relied on general knowledge | Cited the installed `send` source (`mime.contentType(ext)`). Evidence E31 | Yes |
| AUD-16 | Incomplete role description | The back-office module omitted that the Audit tab is visible to every role and mislabelled line 303 | Module corrected | Yes |
| AUD-17 | Sensitive identifier in docs | `openapi.yaml` used a **real uploaded filename** from `backend/uploads/` as an example. Legacy uploads with no ownership row are readable by any authenticated user (SEC-10), so this was an actionable pointer to a real document | Replaced with the placeholder `<epoch-ms>_<16-hex>.png` | Yes: grep shows 0 occurrences |
| AUD-18 | External legal claims presented as findings | Named Israeli laws, Amendment 13 and its dates come from general knowledge, not repository evidence | A disclaimer was added to `security-and-privacy.md` §6 | n/a (cannot be verified from the repo) |
| AUD-19 | Incomplete instruction | The operations backup command needs the `sqlite3` CLI, which is not a project dependency | Prerequisite stated | Yes |
| AUD-20 | Unexecuted claim stated as fact | "`npm run clean` fails on Windows" was not executed | Relabelled "expected … (inferred, not executed)" | n/a |
| AUD-21 | Generic claim | "`sqlite3` ships prebuilt binaries" is general package knowledge | Relabelled as general behaviour, not verified | n/a |

## 4. Items reviewed and found accurate (no change)

- All 28 endpoints, their middleware and their auth behaviour (`server.js:386-1286`).
- The DEMO_MODE behaviour (SEC-01), including `jwt.decode` fallbacks at `server.js:112-119, 132-135` and the `canAccessUser` demo clause.
- Schema tables and columns, the ALTER list, absence of explicit indexes, and FK not enforced (no `PRAGMA foreign_keys`, Verified by grep).
- Client-side OTP fallback (SEC-05), including the cross-account write path: a stale token's `sub` becomes `userId` on PUT of a new draft (`server.js:979`).
- Plaintext localStorage passwords (SEC-06), sign-out not clearing the JWT (SEC-07), simulated funding, random digest, simulated OCR, placeholder KPIs.
- Credit-engine and eligibility rules. The mirror thresholds are identical.
- The back office exposes only 7 of the 13 credit-rule fields.
- Test results (32/32, 42/45, 8/8) and the `tsc` errors.
- No secrets, the JWT dev secret value, phone numbers or DB row contents in `docs/` (grep).
- No React Context/Redux/Zustand, no error boundary, no service worker (grep).

## 5. Post-correction verification

These checks were run **after** all edits on 2026-10-11:

| Check | Command / method | Result |
|---|---|---|
| Relative links and anchors | Node script over all `docs/**/*.md` | **119 links, 0 broken** |
| `file:line` citations (`.js/.ts/.tsx`) exist and are in range | Node script against `git ls-files` | **439 citations, 0 out of range** |
| `openapi.yaml` | `js-yaml` 4.1.0 parse plus `$ref` resolution | **Parsed. 79 refs, 0 unresolved** |
| Secrets and identifiers | grep for the dev JWT secret, `+972…` numbers, upload filenames, Twilio SIDs | **0 matches** |
| Stale incorrect values removed | grep for the superseded values (₪868, 5,208, "No clipboard API usage", `S6 & S7`, "§7/§8", "age ≥ `minBorrowerAge`", the wrong Step11 line numbers) | **0 matches outside this audit report.** The 5 remaining matches are this report quoting the old values |
| Corrections present | grep for FIN-17, SEC-21, ₪867, Google Fonts, MNT-14, the new module links | All present (FIN-17 in 6 files, SEC-21 in 6, ₪867 in 3) |

Range checks show that a cited line exists. Content correctness was established separately by the line-by-line review in §1 and the re-reads in §3.

## 6. Coverage of this audit

| Area | Coverage |
|---|---|
| `backend/server.js`, `database.js`, `creditEngine.js`, services | Full re-read of every cited region. All claims re-checked |
| `frontend/src/services/*`, `App.tsx`, `config/appConfig.ts` | Every cited region re-checked |
| Components | Cited regions re-checked. `HelpModal` and `MyApplications` newly reviewed. Presentational code of other steps (layout, styling) **not** reviewed |
| Tests | Structure and failure analysis re-checked. Tests were not re-run, since the code is unchanged since the earlier run |
| Build | Bundle inspected for DEF-01. Build not re-run |
| Infrastructure | None exists in the repo |
| Design mockups | Not reviewed |

## 7. Remaining unverified claims

These remain in the documentation, labelled accordingly. They could not be confirmed with the available evidence:

1. **DEF-04:** a back-office status change throws for applications that exist only on the server. Code path only. Needs a browser run.
2. **DEF-01 runtime crash:** confirmed in source and bundle, but not observed in a browser.
3. **SEC-10 exploitability:** whether a polyglot upload is actually rendered as active content from the API origin.
4. **FIN-05:** concurrent duplicate request numbers. Design-level only, with no concurrency test.
5. **FIN-06:** lost updates in practice. Design-level only.
6. **FIN-14:** client and server draft divergence. Suspected.
7. **FIN-17 over HTTP:** the bank-account change after approval was verified from code, not by an HTTP request.
8. **Whether `backend/database.sqlite` contains real personal data (SEC-14).**
9. **Deployment state:** whether any environment ran with DEMO_MODE on and was reachable.
10. **Dependency vulnerabilities:** `npm audit` not run.
11. **Regulatory applicability** and the named Israeli statutes and dates (AUD-18).
12. **PDF rendering of non-Latin text (DEF-10).** Inferred from fonts, not rendered.
13. **i18n completeness count (28 keys):** produced by an indentation-based parser.
14. **"Encrypted via TLS 1.3"** and any TLS posture: deployment not accessible.
15. **Twilio and SMTP delivery behaviour, rate limits and sender configuration:** accounts not accessible.
16. **Visual and UX conformance** to `design/*.png`.
