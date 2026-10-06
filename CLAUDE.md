# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

QuickLoan Israel: a multilingual digital loan application for foreign workers. Two independent npm projects with no root `package.json`:

- `backend/`: Express 5 + SQLite (CommonJS, plain JS) REST API on port 5000
- `frontend/`: React 19 + Vite 6 + Tailwind v4 + TypeScript SPA on port 3000

The root `README.md` is leftover AI Studio boilerplate. `GEMINI_API_KEY` in `frontend/.env.example` is not used by the app logic. `implementation-plan.md` records the 8 completed enhancement phases (JWT auth, multer uploads, analytics, SSE, notifications, history, PDF export, credit pre-screening) and is useful for history.

## Commands

Backend (run from `backend/`):
- `npm run dev`: nodemon server
- `npm start`: plain node
- `node test_verification.js`: the only test suite. It is a self-contained integration script that `require`s `server.js`, listens on port 5002, makes real HTTP calls against the real `database.sqlite`, prints PASSED/FAILED counts, and exits non-zero on failure. `npm test` is a stub. You cannot run a single test; edit or comment out sections of the script.

Frontend (run from `frontend/`):
- `npm run dev`: Vite on `0.0.0.0:3000`
- `npm run lint`: type-check only (`tsc --noEmit`); there is no ESLint
- `npm run build`: production bundle

`frontend/*.py` are one-off fix-up scripts with hardcoded absolute paths. They are not part of the build.

## Backend architecture

- `server.js` holds every route in one file. It exports `app` and only calls `listen` when it is run directly (`require.main === module`), which is how the test script reuses it.
- **Auth ordering matters.** `optionalAuth` runs globally. Public auth routes (`/api/users/login`, `request-otp`, `verify-otp`, `forgot-password`, `/api/auth/staff-token`, …) are declared *before* `app.use('/api', authenticate)`. Everything after that line requires a JWT. Staff-only routes add `requireStaff(...roles)`. Staff roles: `customer_service`, `credit_reviewer`, `system_admin`, `funding_entity`. Borrowers get user tokens; staff get role tokens.
- **DEMO_MODE** is on unless `NODE_ENV=production` or `DEMO_MODE=false`. It enables fixed OTP `123456`, role-picker staff tokens via `/api/auth/staff-token`, mock Google login, and reset/OTP codes echoed back in responses. In production, `JWT_SECRET` is required; dev falls back to a hardcoded secret.
- **Persistence:** `database.js` creates tables on startup with `CREATE TABLE IF NOT EXISTS`. Schema migrations are `ALTER TABLE ... ADD COLUMN` calls that ignore "duplicate column" errors; add new columns the same way. Nested application sections (`borrowerDetails`, `loanRequest`, `documents`, `statusHistory`, …) are stored as JSON text columns. They are decoded by `parseApp()` and written by `writeApp()`. `database.sqlite` is committed to git, so running the server or tests modifies it.
- **Status changes:** `PUT /api/applications/:id` drives the workflow. It runs `applyRiskScore` (from `creditEngine.js`), `notifyStatusChange` (DB notification plus SMS/email), and `broadcastAppEvent` to SSE subscribers on `GET /api/applications/:id/events`. Statuses are listed in `OPEN_STATUSES` and `DECIDED_STATUSES`.
- `creditEngine.js` does advisory rule-based scoring and never blocks a submission. Defaults live in `DEFAULT_CREDIT_RULES`. Admin overrides are stored in the `app_config` table through `/api/config/credit-rules`.
- **Uploads** go to `backend/uploads/` (gitignored). Each upload is checked by magic bytes and has its owner recorded in `uploaded_files`. `stripInlineFiles` removes base64 blobs before persisting.
- `services/smsService.js` (Twilio) and `services/emailService.js` (nodemailer) fall back to console logging when `TWILIO_SID`/`TWILIO_TOKEN` or `SMTP_USER` are not set. `services/pdfService.js` streams application PDFs with pdfkit.

## Frontend architecture

- **No router.** `App.tsx` is a state machine: `currentStep` 1–11 selects a `StepN*` component (1 language, 2 auth, 3–8 form sections, 9 review/sign, 10 success, 11 live status timeline). `isBackOfficeOpen` swaps the whole view for `BackOffice.tsx` (the staff console, including the analytics tab).
- **Two data layers.** Keep both in mind when changing data flow:
  - `services/storage.ts` (`storageService`) is a localStorage-backed local store. It is the source of truth for the wizard: current user, active draft, submit/request-number generation, and seeded demo data.
  - `services/api.ts` (`apiService`) is the backend client. It attaches the `Bearer` JWT (borrower and staff tokens are kept under separate localStorage keys) and reads its base URL from `VITE_API_URL` (default `http://localhost:5000/api`). `App.tsx` writes locally first, then syncs to the API in the background with `.catch` (fire-and-forget). Network failures (`isNetworkError`) are tolerated, so the UI keeps working without a backend.
- **Domain types:** all of them live in `src/types.ts` and mirror the backend's application JSON shape. Update both sides together.
- **i18n:** `src/i18n/translations.ts` is a flat `TRANSLATIONS: Record<Language, Record<string,string>>` with `t()`. Languages are `en`, `he` (RTL, set on `<html dir>` in `App.tsx`), `th`, `zh`, and `tl`. Every new UI string needs a key in all five languages.
- **Configuration:** `src/config/appConfig.ts` holds app config and dropdown options. `design/DESIGN.md` defines the "High-Integrity Fintech" design tokens, and `design/*.png` contains the reference screens.
