// Phase 5 guard (T5.2): numbers and dates in the UI go through i18n/format.ts, so they follow
// the app language instead of the browser locale. Hand-written "₪{...}" prefixes are caught too.
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

const SRC = path.resolve(__dirname, '../..');
const FILES = [
  path.join(SRC, 'App.tsx'),
  ...fs
    .readdirSync(path.join(SRC, 'components'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => path.join(SRC, 'components', f)),
];

const BARE_LOCALE = /\.toLocale(?:String|DateString|TimeString)\(/g;
const SHEKEL_PREFIX = /₪\{/g;

const lineOf = (src: string, index: number) => src.slice(0, index).split('\n').length;

describe('Locale-aware formatting only (T5.2)', () => {
  for (const file of FILES) {
    const name = path.basename(file);
    const src = fs.readFileSync(file, 'utf8');

    it(`${name} uses i18n/format.ts for numbers, amounts and dates`, () => {
      const found: string[] = [];
      for (const m of src.matchAll(BARE_LOCALE)) found.push(`${name}:${lineOf(src, m.index!)}  ${m[0]}`);
      for (const m of src.matchAll(SHEKEL_PREFIX)) found.push(`${name}:${lineOf(src, m.index!)}  hand-written ₪ prefix`);
      expect(found).toEqual([]);
    });
  }
});
