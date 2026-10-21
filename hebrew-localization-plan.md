# Hebrew / English Localization Plan

Goal: a user can switch between **English** and **Hebrew** at any point in the app (wizard, status screens, back office). Hebrew must be fully translated, laid out right-to-left, and formatted for Israel. The choice must persist across reloads and logins.

**Decisions (2026-10-21):**
- The **back office** is translated to Hebrew too.
- The **PDF application summary** is generated in Hebrew too.
- **Thai, Chinese and Filipino are on hold.** They are hidden from the language pickers, but their translations stay in `translations.ts` so they can be brought back later. New keys are added to `en` and `he` only, and the other languages fall back to English. `CLAUDE.md` is updated to match.

---

## Progress

| Phase | Status |
|---|---|
| 0 Test harness | ✅ Done 2026-10-21. Vitest + RTL + jsdom (`npm test`). The 28 known missing Hebrew keys are listed as `PENDING_MISSING` in `translations.test.ts`; Phase 2 empties that list. |
| 1 Language state and persistence | ✅ Done 2026-10-21. See notes below. |
| 2 Complete the Hebrew dictionary | ✅ Done 2026-10-21. 28 keys added, orphan `investment` removed, glossary comment added at the top of the `he` block. |
| 3 Hard-coded text | ✅ Done 2026-10-21. See notes below. |
| 4–7 | Not started |

Phase 1 notes (where the build differs from the plan text):
- The localStorage key is `quickloan_language` (matches the other `quickloan_*` keys).
- The provider owns language, `dir` and persistence. Saving to the user's account happens in `App.tsx` (`syncUserLanguage`), because the provider doesn't know who is logged in.
- On login, a choice saved on this device wins and is pushed to the account. Without one, the account's language is used. A submitted application's `language` is not changed by switching.
- Components still receive `language` as a prop. Moving them to `useI18n()` happens file by file in Phase 3.
Phase 3 notes:
- New strings live in `frontend/src/i18n/messages/{common,auth,wizard,status,backoffice}.ts` (en + he only) and are merged into `TRANSLATIONS`. A test fails on duplicate keys.
- Stored English values stay unchanged. Display goes through helpers in `i18n/options.ts`: `optionLabel` (dropdown values), `statusLabel`, `roleLabel`, `riskLevelLabel`, `riskFlagLabel`, `qualityLabel`, `docTypeLabel`.
- API and local errors go through `localizeError()` in `i18n/apiErrors.ts`. Known backend messages are translated; unknown ones show as-is in English and as a generic message in Hebrew.
- Eligibility factor descriptions: both scoring mirrors now also return `descriptionKey` and `descriptionParams` (scores unchanged). Older saved breakdowns fall back to the English `description`.
- The visa check (`isVisaValidForLoan`) returns `reasonKey` and `reasonParams` next to the English reason.
- `backend/creditEngine.js` exports `RISK_FLAG_CODES`. A frontend test checks it matches the codes the engine emits and that each has a translation.
- Branding: user-facing "LendGlobal" text changed to QuickLoan (registration title, app footer). The footer now shows the number of enabled languages instead of "5 languages".
- Fixed along the way: 24 translation keys that were used but missing in every language, so the raw key name was shown (e.g. `acceptAndSubmit`, `statusReceivedTitle`, `'Start New Application'`). The help FAQ always showed English questions.
- Guard tests: `no-hardcoded-text.test.ts` scans every component and `App.tsx` (an `i18n-ignore` comment exempts a line, for brand names and demo data). `coverage.test.ts` checks that every `t()` key used in code exists in en and he (about 700 references), and that every dropdown, status, role, risk level, document type and risk flag has a Hebrew label. `hebrewScreens.test.tsx` renders the login screen, wizard steps 3–11, back office and analytics in Hebrew and fails on any English sentence.
- Left as data, for Phase 6: text that is stored and later displayed is still English. This covers the default status reasons the back office saves ("Loan criteria satisfied…"), notification titles and messages from the backend and from the local fallback in `storage.ts`, and document `qualityIssues`. Staff-typed notes stay as typed.
- Needs native-speaker review (Phase 7): the service charge disclaimer, terms 1–7, consent texts and the e-signature notice.
- Existing backend failures, not caused by this work: `test_guarantors_and_scoring.js` fails 3 of 45 in section 7 (expected scores of 90/100), with or without these changes.

## 1. Where things stand (audit, 2026-10-21)

Some of this already exists, so the plan builds on it rather than starting over.

| Area | Status |
|---|---|
| Translation dictionary (`frontend/src/i18n/translations.ts`) | `he` block exists: **249 of 276** English keys. 28 keys missing, 1 orphan key (`investment`). |
| `t(lang, key, params)` helper | Works, falls back to English, then to the raw key. |
| Language picker | In `Header.tsx` (dropdown) and `Step1Language.tsx`. |
| RTL switch | `App.tsx:68-69` sets `<html lang dir>`. `dir` is hard-coded as `=== 'he'` instead of read from `SUPPORTED_LANGUAGES`. |
| Hebrew font | Heebo is loaded in `index.html` and applied under `[dir="rtl"]` in `index.css`. |
| Arrow icons | Most wizard arrows already use `rtl:rotate-180`. |
| **Persistence** | ❌ `useState<Language>('en')`: the choice is lost on reload until the user logs in and their draft loads. No backend endpoint updates `users.preferredLanguage` after registration. |
| **Untranslated screens** | ❌ `Step2Auth.tsx` (1,612 lines, zero `t()` calls), `BackOffice.tsx`, `AnalyticsDashboard.tsx`, `MyApplications.tsx`, `NotificationDrawer.tsx`, `NotificationBell.tsx`, `EligibilityScoreBar.tsx`, `ErrorBoundary.tsx`. Partial: `Header.tsx` (~11 literals), `Step11StatusTimeline.tsx` (~8), `Step7Guarantor.tsx` (~6), `Step8DocumentUpload.tsx`, `ReturningUserConfirmModal.tsx`. |
| **RTL-unsafe CSS** | ❌ About 75 physical-direction Tailwind classes (`ml-/mr-/pl-/pr-/left-/right-/text-left/space-x-/rounded-l…`). Worst files: `Step2Auth` (23), `BackOffice` (14), `Header` (8), `Step5` (6). |
| **Number/date formatting** | ❌ About 20 bare `toLocaleString()` / `toLocaleDateString()` calls, which follow the browser locale instead of the app language. Currency is a hard-coded `₪` prefix. |
| **Backend messages** | ❌ `STATUS_MESSAGES` in `server.js:346` (SMS/push status updates) are English-only, even though `notifications.language` is stored. PDF summary is English-only. |
| **Frontend tests** | ❌ No test framework. Only `tsc --noEmit`. |

Missing Hebrew keys: `pleaseSpecify, provideDetails, docPassportTitle, docPassportDesc, docPaySlipTitle, docPaySlipDesc, docWorkersCardTitle, docWorkersCardDesc, ocrExtractionTitle, ocrExtractionDesc, confirmOcrData, imageBlurWarning, uploadFile, gracePeriodLabel, gracePeriodHint, loanAmountLabel, estimatedRepaymentTitle, estimatedMonthlyRepayment, otherPurposePlaceholder, requiredField, minAgeError, ageYears, addressInIsraelLabel, city, streetBuilding, fullNamePassportLabel, trackApplicationStatus, nextStepsTitle`.

---

## 2. Approach

1. **Tests first.** Add a frontend test harness and write the i18n tests before changing code. They will fail at first (missing keys, hard-coded strings) and pass as each phase lands.
2. **One source of truth for the language.** A small React context (`LanguageProvider` + `useI18n()`) replaces passing `language` as a prop through every screen. It owns persistence, `dir` and formatting helpers.
3. **Logical CSS, not mirrored CSS.** Use Tailwind v4's logical utilities (`ms-/me-/ps-/pe-/start-/end-/text-start/text-end/rounded-s/e/border-s/e`) so the same markup works in both directions without `rtl:` overrides everywhere.
4. **Ship in small, testable phases.** Each phase ends with `npm run lint`, the test suite and a manual check in both languages.

---

## 3. Step-by-step procedure

### Phase 0: Test harness and baseline (≈0.5 day)

**Steps**
1. In `frontend/`, install dev dependencies: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
2. Add a `test` block to `vite.config.ts` (`environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`).
3. Add scripts to `frontend/package.json`: `"test": "vitest run"` and `"test:watch": "vitest"`.
4. Add the first test file `src/i18n/__tests__/translations.test.ts` (tests below).
5. Update `CLAUDE.md` with the new test command.

**Tests written in this phase (expected to fail at first)**
- `T0.1 key parity`: every key in `TRANSLATIONS.en` exists in `TRANSLATIONS.he`, and `he` has no keys that `en` lacks. *(Fails now: 28 missing, 1 extra.)*
- `T0.2 no empty values`: no `he` value is an empty string or identical to the key name.
- `T0.3 placeholder parity`: every `{param}` token in an English string also appears in its Hebrew string (for example `{amount}`, `{years}`).
- `T0.4 t() behaviour`: returns Hebrew for `he`, falls back to English for an unknown key in `he`, returns the key when missing everywhere, and replaces repeated placeholders.
- `T0.5 Hebrew script sanity`: each `he` value contains at least one Hebrew character (`/[֐-׿]/`), except an explicit allowlist (brand names such as "QuickLoan", units, "OTP").

**Done when** the harness runs and `T0.4` passes. `T0.1`–`T0.3` and `T0.5` stay red until Phase 2.

---

### Phase 1: Language state, switching and persistence (≈1 day)

**Steps**
1. Create `src/i18n/LanguageContext.tsx`:
   - State `language`, `setLanguage(lang)`, `dir` (read from `SUPPORTED_LANGUAGES`, not hard-coded), `t(key, params)` bound to the current language.
   - Initial value order: `localStorage['ql_language']` → logged-in user's `preferredLanguage` → browser `navigator.language` starting with `he` → `'en'`.
   - On change: write to `localStorage` (inside try/catch), set `document.documentElement.lang` and `dir`, update the active application's `language`, and, when logged in, call the backend (step 4).
2. Wrap `<App>` in `<LanguageProvider>` in `main.tsx`. Move the `useEffect` at `App.tsx:66-70` into the provider.
3. Add an `enabled` flag to each entry in `SUPPORTED_LANGUAGES` (`true` for `en` and `he`, `false` for `th`, `zh` and `tl`) and an `ENABLED_LANGUAGES` export. Both pickers (`Header.tsx` dropdown, `Step1Language.tsx`) list only enabled languages.
   - The header shows a **language dropdown** on every screen, including the back office. The button shows the current language (EN / עב). The menu lists the enabled languages with the current one checked, and closes on selection, an outside click or Escape. (Changed 2026-10-21 at the user's request; it was a one-tap toggle.)
   - If a stored or saved preference points to a disabled language (an old user with `th`), the provider falls back to `en`.
4. Backend: add `PUT /api/users/me/language` (authenticated, body `{ language }`, validated against `['en','he','th','zh','tl']`). It updates `users.preferredLanguage`. Add `apiService.updatePreferredLanguage()`.
5. Migrate components gradually from the `language` prop to `useI18n()`. Keep the prop working until every consumer has moved, then remove it.

**Tests**
- `T1.1 (unit, LanguageContext)`: the default is `en` with empty storage. It restores `he` from `localStorage`. `setLanguage('he')` sets `<html dir="rtl" lang="he">`, and switching back sets `ltr`/`en`.
- `T1.2 (unit)`: when `localStorage` throws (private mode), the provider still renders and switching still works.
- `T1.2b (unit)`: a stored `th` preference resolves to `en`. `ENABLED_LANGUAGES` is exactly `['en','he']`.
- `T1.2c (component, Step1Language)`: only English and Hebrew options render.
- `T1.3 (component, Header)`: the dropdown button shows the current language and opens a menu of English and Hebrew with the current one checked. Picking a language switches it and closes the menu. Picking the current language does nothing. An outside click or Escape closes the menu.
- `T1.4 (component, App)`: switching language mid-wizard (for example on Step 6) keeps the user on the same step with form values intact.
- `T1.5 (backend, new script `backend/test_i18n.js` on port 5005, same pattern as existing tests)`:
  - `PUT /api/users/me/language {language:'he'}` → 200, and a later read of the user returns `preferredLanguage: 'he'`.
  - An invalid or disabled language (`'xx'`, `'th'`) → 400. The backend accepts only `en` and `he` while the others are on hold.
  - No token in production mode → 401 (run with `DEMO_MODE=false`).

---

### Phase 2: Complete the Hebrew dictionary (≈0.5 day + native review)

**Steps**
1. Add the 28 missing keys to the `he` block (list in section 1).
2. Delete the orphan `investment` key from `he`. No component uses it (checked 2026-10-21).
3. Create a short glossary at the top of the `he` block (comment) for consistent financial terms, for example: guarantor = ערב, monthly repayment = החזר חודשי, grace period = תקופת גרייס, pay slip = תלוש שכר, work visa = אשרת עבודה, interest = ריבית.
4. Flag consent, terms and legal-style strings for review by a native Hebrew speaker (ideally someone with lending or compliance background) before release.

**Tests**
- `T0.1`, `T0.2`, `T0.3` and `T0.5` now pass.

---

### Phase 3: Translate hard-coded text in components (≈2–3 days)

Work file by file, largest user-facing impact first:

1. `Step2Auth.tsx`: login, registration, OTP and Google demo screens (no `t()` today).
2. `Header.tsx`: titles, tooltips, `aria-label`s, "Change Language", online/offline status.
3. `Step11StatusTimeline.tsx`, `Step7Guarantor.tsx`, `Step8DocumentUpload.tsx`, `Step10SubmissionSuccess.tsx`, `ReturningUserConfirmModal.tsx`, `Step3`/`Step5`/`Step9` (remaining literals).
4. `MyApplications.tsx`, `NotificationDrawer.tsx`, `NotificationBell.tsx`, `EligibilityScoreBar.tsx`, `ErrorBoundary.tsx`.
5. Validation and error messages: map backend error responses to translation keys in `api.ts` (for example `error.code` → key) instead of showing raw English `error` strings. Add a generic `errorGeneric` fallback.
6. Status names and eligibility factor labels: translate via keys such as `status.SUBMITTED` and `eligibility.factor.salary`, not by displaying the raw enum.
7. **Back office** (`BackOffice.tsx`, `AnalyticsDashboard.tsx`, and the staff role picker): translate every label the same way, with keys grouped under a `bo.` prefix (`bo.queue.title`, `bo.filter.status`, `bo.action.approve`, …). This covers:
   - table headers, filters, search and empty states;
   - action buttons and confirmation dialogs (approve, reject, request documents);
   - the application detail panel (borrower, employment, loan, guarantors, documents, risk flags, eligibility breakdown, audit history);
   - status and role names, and analytics chart titles, axis labels, legends and tooltips.

   Keep raw data (names, IDs, notes typed by staff) as entered. Risk flag codes from `creditEngine.js` get display keys (`bo.risk.<FLAG_CODE>`) instead of showing the code.
   The staff UI language is independent of the borrower's application language. The detail panel shows the application's language as a translated label ("עברית" / "English"), not `HE`/`EN`.

Conventions:
- Translate `placeholder`, `title`, `aria-label` and `alt` too, not only visible text.
- Never build sentences by concatenation (`'Hello ' + name`). Use placeholders: `t('greeting', { name })`. Hebrew word order differs.
- Add each new key to `en` and `he` in the same commit. Skip `th`, `zh` and `tl` while they are on hold. They fall back to English, and a key-parity report for them can be run when they are re-enabled.

**Tests**
- `T3.1 (static guard)`: `src/i18n/__tests__/no-hardcoded-text.test.ts` scans `src/components/*.tsx` for JSX text nodes and `placeholder|title|aria-label|alt="..."` attributes that contain two or more Latin words. It fails with file:line. It supports an allowlist (brand names, demo-only debug text). Each refactored file is removed from a "pending" list, so the test tightens as work progresses.
- `T3.2 (component, Step2Auth in he)`: render with Hebrew. The phone label, "Send code" button and OTP prompt match the `he` dictionary values, and no English sentence is present (`queryByText(/[A-Za-z]{3,} [A-Za-z]{3,}/)` is null, allowlist aside).
- `T3.3 (component, each wizard step in he)`: a parametrized test renders Steps 3–11 with minimal fixture data under `he` and asserts the step title equals `t('he', '<titleKey>')`.
- `T3.4 (unit, api.ts)`: a backend 400 with a known error code is shown as the Hebrew message, and an unknown code is shown as `errorGeneric`.
- `T3.5 (component, BackOffice in he)`: render with two fixture applications. The queue headers, the status filter options and the approve and reject buttons match `he` dictionary values. Opening an application shows Hebrew section titles.
- `T3.6 (unit)`: every risk flag code has a `bo.risk.*` key in `en` and `he`.
  - Today `creditEngine.js` stores flags as `"CODE: English text"` strings. Add an exported `RISK_FLAG_CODES` list (`SALARY_RATIO_FAIL`, `SALARY_RATIO_WARN`, `DATA_MISSING`, `VISA_EXPIRY_RISK`, `TENURE_FAIL`, `TENURE_WARN`) and mirror it in a frontend constant.
  - The back office translates the part before `:` and passes numbers (for example tenure months) as placeholders.
  - The test checks the two lists match, so new flags fail until they are translated.
- `T3.7 (component, AnalyticsDashboard in he)`: chart titles and legend labels are in Hebrew. Amounts are formatted via `formatCurrency` (Phase 5).

---

### Phase 4: Right-to-left layout (≈1.5 days)

**Steps**
1. Replace physical classes with logical ones across components:
   `ml-*→ms-*`, `mr-*→me-*`, `pl-*→ps-*`, `pr-*→pe-*`, `left-*→start-*`, `right-*→end-*`, `text-left→text-start`, `text-right→text-end`, `rounded-l*→rounded-s*`, `rounded-r*→rounded-e*`, `border-l→border-s`, `border-r→border-e`, `space-x-*→gap-*` (on flex parents).
   Do it by hand per file, not with a blind regex: some `left-1/2` centring and decorative positions must stay physical.
2. Mixed-direction content: wrap phone numbers, passport/visa numbers, emails, request numbers, IBANs and amounts in `dir="ltr"` (inputs) or `<bdi>` (inline text) so `+972 50…` does not render reversed. Phone, email, passport and OTP inputs get `dir="ltr"` and `inputMode` as appropriate.
3. Direction-implying icons: audit `ChevronLeft/Right`, `ArrowLeft/Right` (beyond the ones already handled) and progress or slider fills (`WizardProgress`, `EligibilityScoreBar`, loan amount slider in `Step6`). Mirror them with `rtl:rotate-180` or logical positioning.
4. Drawers and modals: `NotificationDrawer` should slide in from the inline-end side.
5. Fonts: confirm Heebo covers all weights in use (currently 400–700; check whether `font-extrabold` (800) is used in Hebrew text and add weight 800 to the font URL if so). Remove negative `letter-spacing` on headings under `[dir="rtl"]`, since it hurts Hebrew legibility.

**Tests**
- `T4.1 (static guard)`: `no-physical-direction.test.ts` scans `src/components` for the physical class patterns above and fails on any match not in a short, commented allowlist.
- `T4.2 (component)`: with `he`, phone and OTP inputs render with `dir="ltr"`, and the request number in Step 10 is wrapped in `bdi` or `dir="ltr"`.
- `T4.3 (manual visual check)`: for each screen in section 4, screenshot EN and HE at 375px and 1280px and confirm the layout is mirrored, with no overlap, clipping or horizontal scroll.

---

### Phase 5: Numbers, currency and dates (≈0.5 day)

**Steps**
1. Add `src/i18n/format.ts` with `formatCurrency(amount, lang)` (`Intl.NumberFormat` with `currency: 'ILS'`, locale `he-IL` or `en-IL`), `formatNumber`, `formatDate`, `formatDateTime` and `formatTime`. Expose them through `useI18n()`.
2. Replace the ~20 `toLocaleString()/toLocaleDateString()/toLocaleTimeString()` calls and the hand-written `₪{...}` prefixes.
3. Keep Western digits (0–9) in both languages, which is standard in Israel.

**Tests**
- `T5.1 (unit, format.ts)`: `formatCurrency(12500,'he')` contains `12,500` and `₪`. `formatCurrency(12500,'en')` contains `₪12,500`. `formatDate` for a fixed date returns `21.10.2026` style for `he` and an English month or day order for `en`. Assert with regex, because ICU spacing (narrow no-break spaces) varies.
- `T5.2 (static guard)`: no bare `toLocale(String|DateString|TimeString)()` remains in `src/components`.

---

### Phase 6: Backend messages in the user's language (≈1 day)

**Steps**
1. Make `STATUS_MESSAGES` in `server.js` two-level: `{ en: {...}, he: {...} }`. `notifyStatusChange` picks `user.preferredLanguage || application.language || 'en'` and falls back to English for other languages. The same applies to notification titles.
2. Email templates in `services/emailService.js`: the same per-language selection. Hebrew emails get `dir="rtl"` on the HTML body.
3. SMS: Hebrew SMS is sent as UCS-2 (70 characters per segment). Keep the Hebrew status messages short, and log the segment count in mock mode.
**Tests (in `backend/test_i18n.js`)**
- `T6.1`: create a user with `preferredLanguage: 'he'` and an application, change status via `PUT /api/applications/:id` (staff token), then `GET /api/notifications/:userId`. The latest message contains Hebrew characters and has `language: 'he'`.
- `T6.2`: the same flow for an `en` user returns the English message.
- `T6.3`: a `th` user falls back to English without error.
- `T6.4`: every status key in `STATUS_MESSAGES.en` also exists in `STATUS_MESSAGES.he`.

---

### Phase 6b: Hebrew PDF summary (≈1.5 days)

`services/pdfService.js` (pdfkit 0.20) currently uses built-in Helvetica, which has no Hebrew letters, and hard-codes English labels. pdfkit also has no right-to-left support. It draws characters left to right in the order given, so Hebrew must be reordered before drawing.

**Steps**
1. **Fonts:** add `backend/assets/fonts/Heebo-Regular.ttf` and `Heebo-Bold.ttf` (Google Fonts, SIL Open Font License; commit the license file next to them). Register them with `doc.registerFont('he', …)` and `doc.registerFont('he-bold', …)`. Heebo also contains Latin letters and digits, so mixed lines render with one font.
2. **Language choice:** `GET /api/applications/:id/pdf?lang=he|en`.
   - The default is `application.language`, then `en`.
   - Borrowers get their own language. Staff can pass `?lang=` to match their back office UI. The back office "Download PDF" button sends the current UI language.
   - Disabled or unknown values fall back to `en`.
3. **Labels:** move every label string ("Loan Application Summary", section titles, field names, status names, risk flag names) into a `services/pdfLabels.js` dictionary with `en` and `he`, the same keys as the frontend where possible.
4. **Right-to-left text:** add the `bidi-js` dependency and a helper `rtlText(doc, text, x, y, opts)` that:
   1. breaks the paragraph into lines itself, measuring with `doc.widthOfString()` (pdfkit's own wrapping would break the reordered text in the wrong places);
   2. runs `bidi-js` on each line to get visual order, so numbers, request numbers, phone numbers and English names inside Hebrew text stay readable left to right;
   3. draws each line with `align: 'right'`.
5. **Layout mirroring:** in Hebrew, labels sit on the right and values on the left, the "Generated …" timestamp moves to the left of the header band, and table columns are mirrored. The simplest approach is a small `x(pos)` helper that returns `pageWidth - pos - width` when `lang === 'he'`.
6. **Formatting:** dates as `DD.MM.YYYY` and amounts as `12,500 ₪` in Hebrew. Keep `NIS 12,500` in English, or switch both to `₪`. Use the same `Intl` rules as frontend Phase 5.
7. **Filename and metadata:** set the PDF `info.Title` in the chosen language and `Lang` to `he-IL`. Keep the download filename ASCII (the request number) so it works in every browser.
8. **Brand name:** the PDF header says "LendGlobal Israel" while the app is QuickLoan. Confirm which name to use while the labels are being edited.

**Tests (in `backend/test_i18n.js`)**
- `T6b.1`: `GET /api/applications/:id/pdf?lang=he` → 200, `Content-Type: application/pdf`, the body starts with `%PDF`, and the raw bytes contain the embedded font name `Heebo`.
- `T6b.2`: `?lang=en` → 200, and Heebo is **not** embedded (Helvetica is still used for English, so the file stays small). If Heebo is used for both, assert on `/Lang (en-US)` instead.
- `T6b.3`: with no `lang`, a Hebrew application (`language: 'he'`) gets the Hebrew PDF and an English application gets English.
- `T6b.4`: `?lang=xx` → 200 with the English PDF (fallback, not an error).
- `T6b.5 (unit, `rtlText` helper)`: `bidi-js` reordering of `'בקשה מספר QL-1234'` keeps `QL-1234` as one left-to-right run at the visual left end. A long Hebrew paragraph wraps into lines that each fit the given width.
- `T6b.6 (unit)`: `pdfLabels.he` has every key in `pdfLabels.en`.
- `T6b.7 (manual)`: open the Hebrew and English PDFs for a fully filled application (two guarantors, risk flags, long employer name, Hebrew and English names). Check:
  - text is right-aligned, readable and not reversed;
  - numbers and IDs read correctly;
  - nothing is clipped across a page break.

---

### Phase 7: End-to-end QA and release (≈1 day)

**Steps**
1. Run everything: `npm run lint` and `npm test` in `frontend`. In `backend`, run `node test_verification.js`, `node test_guarantors_and_scoring.js`, `node test_returning_user_prefill.js` and `node test_i18n.js`. All must pass, so i18n work does not regress existing features.
2. Run the manual checklist (section 4) in Chrome and Safari on mobile, and in Chrome on desktop.
3. Get the native-speaker review of all `he` strings (especially consent and terms), then apply the fixes.
4. Update `CLAUDE.md` (new context, test command, logical-CSS rule) and add a note to `implementation-plan.md`.

**Optional: automated E2E (Playwright)**
- `E2E.1`: start on the landing page, pick Hebrew, reload, and Hebrew is still active with `dir=rtl`.
- `E2E.2`: complete login with OTP `123456` in Hebrew and fill Steps 3–9. At Step 6, switch to English: the step and values are kept and the text is English. Switch back and submit. The success screen is in Hebrew.
- `E2E.3`: open the back office, pick Hebrew from the language dropdown, and the table headers and filters are Hebrew.

---

## 4. Manual QA checklist (per language: EN and HE)

- [ ] Language choice survives reload, logout/login, and login on a second browser (it comes from the backend).
- [ ] Toggle is reachable from every screen, including Step 2, Step 11 and the back office.
- [ ] Switching mid-form keeps the current step and all entered values.
- [ ] No English left on Hebrew screens (except brand names, user-entered data and numbers).
- [ ] Layout mirrored: back/next buttons, icons, progress bar, drawers, modals, tooltips.
- [ ] Phone numbers, IDs, emails and amounts read correctly (not reversed) in Hebrew.
- [ ] Currency and dates formatted for the language.
- [ ] Validation errors and server errors shown in the active language.
- [ ] Status SMS/notification arrives in the user's language (check the backend console in mock mode).
- [ ] PDF summary downloads in the selected language, from both the borrower status screen and the back office.
- [ ] Back office: queue, filters, detail panel, actions, risk flags and analytics are fully in the selected language.
- [ ] Only English and Hebrew appear in the language pickers.
- [ ] No horizontal scroll at 375px width in Hebrew.
- [ ] Screen reader announces Hebrew (`<html lang="he">`), and `aria-label`s are translated.

---

## 5. Order, effort and definition of done

| Phase | Depends on | Effort |
|---|---|---|
| 0 Test harness | none | 0.5 d |
| 1 State and persistence | 0 | 1 d |
| 2 Dictionary | 0 | 0.5 d + review |
| 3 Hard-coded text (incl. back office) | 1, 2 | 3–3.5 d |
| 4 RTL layout | 1 | 1.5 d |
| 5 Formatting | 1 | 0.5 d |
| 6 Backend messages | 1 (endpoint) | 1 d |
| 6b Hebrew PDF | 5 (formatting rules) | 1.5 d |
| 7 QA and release | all | 1 d |

Phases 4, 5 and 6 can run in parallel after Phase 1, and 6b can start once 5 is done. **Total: about 10–11 working days**, plus native-speaker review time.

**Definition of done**
- All tests T0–T6b are green, and the existing backend tests are still green.
- Both static guards (`no-hardcoded-text`, `no-physical-direction`) pass with no "pending" files left.
- The manual checklist is complete in EN and HE on mobile and desktop.
- A native speaker has signed off on the Hebrew text.

## 6. Decisions and remaining questions

Decided 2026-10-21: the back office is in Hebrew (Phase 3.7). The PDF is in Hebrew (Phase 6b). Thai, Chinese and Filipino are hidden for now (Phase 1.3).

Remaining questions:
1. **Who reviews the Hebrew text?** Name a native speaker before Phase 7.

Also decided 2026-10-21: the PDF brand name is **QuickLoan** (Phase 6b.8).
