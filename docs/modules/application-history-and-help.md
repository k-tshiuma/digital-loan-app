# Module: Application History ("My Applications") and Help/FAQ

Added in the documentation accuracy audit ([documentation-audit.md](../documentation-audit.md), AUD-10). These two modules were missing from the first version of the documentation.

## My Applications

**Purpose:** list a borrower's applications, let them reopen one, and download PDFs.

| Layer | File | Symbols |
|---|---|---|
| UI | `frontend/src/components/MyApplications.tsx` | `fetchHistory` (`:41-57`), `handleDownloadPdf` (`:65-75`) |
| Wiring | `frontend/src/App.tsx:482-504` | `onSelectApplication`, `onStartNewApplication` |
| Client API | `services/api.ts` | `getApplicationHistory`, `downloadApplicationPdf` |
| Server | `backend/server.js:938-948` | `GET /api/applications/history/:userId` (owner, submitted only, risk fields removed) |

Behaviour (Verified):
- Opening the modal calls `apiService.getApplicationHistory(currentUser.id)`. If that **fails or returns an empty list**, it falls back to `storageService.getUserApplications`, i.e. local drafts and submissions, including anything that never reached the server.
- Selecting an application saves it to localStorage, sets it as the active application, and goes to step 11 (if submitted) or to its saved step.
- `implementation-plan.md` task 6.4 says a past application opens in a "read-only detail view (reuse Step 11 component in read-only mode)". **No read-only prop or mode exists** (Verified: no `readOnly`/`isReadOnly` in `MyApplications.tsx` or `Step11StatusTimeline.tsx`). Step 11 renders with its normal actions, such as missing-document upload and "start new application".
- PDF download errors show a browser `alert('Could not download PDF summary.')` in English only.

Known issues: the local fallback can show applications the server does not have (related to FIN-01). The empty-list fallback means a borrower with no server history sees local data instead of "none".

Tests: none.

## Help / FAQ

**Purpose:** a multilingual FAQ modal opened from the header.

| File | Symbols |
|---|---|
| `frontend/src/components/HelpModal.tsx` | `faqs` array (`:15+`) with `q`/`a` plus `_he`, `_th`, `_zh`, `_tl` variants inline (not in `translations.ts`) |

Content accuracy (Verified against code):
- Eligibility (B-1 visa, age ≥ 21, ≥ 6 months visa validity) and limits (₪500–10,000, 3/6/9/12 months) **match** the client config.
- The **document checklist does not match** `DOCUMENT_TYPE_CONFIG` (see SEC-21).
- The **security answer** (encryption at rest, TLS 1.3, immutable audit logs that record every access) **is contradicted by the code** (SEC-21).

Maintenance: FAQ text is hard-coded in the component with per-language keys. It bypasses `translations.ts`, so the translation-completeness check proposed in [i18n-and-localisation.md](i18n-and-localisation.md) will not cover it.
