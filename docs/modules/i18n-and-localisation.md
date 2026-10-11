# Module: Internationalisation and Localisation

Added in the documentation accuracy audit ([documentation-audit.md](../documentation-audit.md), AUD-10).

## Files and symbols
| File | Symbols |
|---|---|
| `frontend/src/i18n/translations.ts` | `SUPPORTED_LANGUAGES` (`:12`), `TRANSLATIONS` dictionaries `en` (`:56`), `he` (`:368`), `th` (`:644`), `zh` (`:920`), `tl` (`:1196`), `t(lang, key, params)` (`:1477-1488`) |
| `frontend/src/types.ts:1` | `Language = 'en' \| 'he' \| 'th' \| 'zh' \| 'tl'` |
| `frontend/src/App.tsx:65-68` | Sets `<html lang>` and `dir="rtl"` for Hebrew |
| `frontend/index.html:12-14` | Google Fonts for Hebrew (Heebo), Thai (Sarabun) and Chinese (Noto Sans SC) |
| `frontend/src/components/HelpModal.tsx` | FAQ translations held inline (not in `translations.ts`) |

## Behaviour (Verified)
- `t()` looks up `TRANSLATIONS[lang][key]`, then the English value, then returns the **key itself**. `{param}` placeholders are replaced with a regex.
- Five languages are supported in code. CLAUDE.md lists four (it omits Tagalog).
- **Completeness:** a script parse of `translations.ts` (2026-10-11) found 275 keys in `en`, and **28 of them missing from each of `he`, `th`, `zh` and `tl`**, for example `pleaseSpecify`, `provideDetails`, `docPassportTitle`, `docPassportDesc`, `docPaySlipTitle`. Those strings appear in English for non-English users (MNT-14). The parser is a heuristic based on indentation and should be confirmed with a proper check.
- Hard-coded English strings also exist in components (MNT-09) and in `alert()` calls.
- **Server-side text is English only:** SMS status messages (`server.js:346-371`), OTP and reset messages, API error messages, and the PDF labels.
- The PDF uses Helvetica, so non-Latin borrower names are likely to render incorrectly (DEF-10, Inferred).

## Extending safely
1. Add each new key to all five dictionaries.
2. Add a CI check that compares the key sets (proposed; it does not exist).
3. For server-generated borrower messages, choose the template by `application.language` or `user.preferredLanguage`. Both are already stored.
