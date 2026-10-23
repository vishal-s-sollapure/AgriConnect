import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORTED_LANGUAGES, translations } from '../src/i18n/translations.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(scriptDirectory, '../src');
const sourceFiles = [];

function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(filePath);
    } else if (/\.(jsx|js|tsx|ts)$/.test(entry.name) && !filePath.includes(`${path.sep}i18n${path.sep}`)) {
      sourceFiles.push(filePath);
    }
  }
}

collectSourceFiles(sourceDirectory);

const referencedKeys = new Set();
const phase8Keys = new Set();
for (const filePath of sourceFiles) {
  const source = fs.readFileSync(filePath, 'utf8');
  for (const match of source.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g)) {
    if (match[1].includes('${')) continue;
    referencedKeys.add(match[1]);
    if (match[1].startsWith('p8_')) phase8Keys.add(match[1]);
  }
}

assert.ok(referencedKeys.size > 0, 'Expected Phase 8 translation references in the UI source.');

function placeholders(value) {
  return [...value.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();
}

for (const { code } of SUPPORTED_LANGUAGES) {
  for (const key of referencedKeys) {
    const translation = translations[code]?.[key];
    assert.equal(typeof translation, 'string', `Missing ${code} translation for ${key}`);
    assert.ok(translation.trim(), `Empty ${code} translation for ${key}`);
    assert.deepEqual(
      placeholders(translation),
      placeholders(translations.en[key]),
      `Placeholder mismatch in ${code} translation for ${key}`
    );
  }
}

console.log(`Phase 8 translations verified: ${phase8Keys.size} Phase 8 keys and ${referencedKeys.size} static UI keys in ${SUPPORTED_LANGUAGES.length} languages.`);
