# Module: Back Office and Analytics

**Purpose:** staff console to search and inspect applications, view documents, change status, run the (simulated) funding hand-off, export data, edit config and credit rules, and view KPIs.

## Files and symbols
| File | Symbols |
|---|---|
| `frontend/src/components/BackOffice.tsx` | `fetchBackendData` (`:84`), `reloadData`, `filteredApps`, `handleStatusChange` (`:132`), `handleFundingHandoff` (`:158`), `handleDownloadSignedJson`, `handleExportCsv`, `handleSaveConfig` (`:193`), tabs `applications \| analytics \| audit \| config` |
| `frontend/src/components/AnalyticsDashboard.tsx` | `computeLocalSummary` (`:60`), `loadData` (`:128`) |
| `frontend/src/components/Header.tsx:163-179` | Back-office toggle (always visible) |
| `frontend/src/services/storage.ts` | `updateApplicationStatus`, `simulateFundingHandoff`, `exportSignedJson`, `exportApplicationsCsv`, `getAuditEvents`, `updateConfig` |
| Server | `GET /applications`, `PUT /applications/:id` (staff branch), `GET /analytics/summary`, `GET/PUT /config/credit-rules`, PDF |

## Data sources (mixed: be careful)
| Feature | Source |
|---|---|
| Application list | API (`listAllApplications`) when reachable **and non-empty**, otherwise localStorage |
| Status change | **localStorage first** (`updateApplicationStatus`), then PUT as staff. Errors are swallowed |
| Funding hand-off | **Simulated locally**, then PUT |
| Audit tab | localStorage only |
| Config tab (`ApplicationConfig`) | localStorage only (this browser only) |
| Credit rules | API (`system_admin` writes) |
| Analytics | API, falling back to a local computation **with placeholder KPIs** (FIN-16) |
| CSV / "signed JSON" export | localStorage only |
| PDF | API |
| Document preview | API file URL with staff token, or `dataUrl` |

## Role gating (UI only)
- Analytics tab (`:277`) and Config tab, which holds `ApplicationConfig` and Credit Policy (`:303`): `credit_reviewer`, `system_admin`. Saving credit rules to the API is attempted only for `system_admin` (`:198`).
- Applications and "Immutable Audit Logs" tabs: every role. The "immutable" label is inaccurate: it is a localStorage array (SEC-21).
- Approve, Request Document, Reject: `credit_reviewer`, `system_admin` (`:1032`).
- Funding hand-off: `funding_entity`, `system_admin`, `credit_reviewer` (`:1070`).
- **No status preconditions** on any action.
- The server allows every staff role to make every change through PUT (SEC-03).

## Known issues
SEC-03, SEC-04, FIN-06, FIN-07, FIN-08, FIN-16. DEF-04 (status change fails for applications that exist only on the server, Suspected). The CSV export does not escape values (formula injection) and includes passport numbers. Actor names are synthetic (`"CREDIT REVIEWER_USER"`).

## Tests (existing)
None for the back office UI. Server staff routes are exercised indirectly only (via `staff-token` in the test scripts, Verified usage in `test_verification.js`).

## Extending safely
- New staff API: declare it after `app.use('/api', authenticate)` and guard it with `requireStaff('<roles>')`. Call it with `scope: 'staff'` in `apiService`.
- Do not add new localStorage-only features to the back office. Staff data must come from the server.
