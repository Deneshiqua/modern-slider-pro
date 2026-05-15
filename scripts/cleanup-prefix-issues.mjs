#!/usr/bin/env node
/**
 * Fixes corrupted msp- prefixes caused by running prefix-classes.mjs multiple times.
 *
 * Issues fixed:
 *  1. Double-prefix: msp-msp-flex → msp-flex
 *  2. Double-negative-prefix: -msp-msp-mt-4 → -msp-mt-4
 *  3. Incorrectly prefixed variants: msp-group-hover:, msp-peer-disabled: → group-hover:, peer-disabled:
 *  4. Multiple-prefix stacking: msp-msp-msp-msp-group-data- → group-data-
 *  5. Broken has-[: content: has-[:msp-disabled]: → has-[:disabled]:
 *  6. Broken [&:has(: [&:msp-msp-has( → [&:has(
 *  7. Broken not( in arbitrary selectors: msp-msp-msp-msp-not( → not(
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function findFiles(dir, exts, results = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') {
            findFiles(full, exts, results);
        } else if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
            results.push(full);
        }
    }
    return results;
}

function cleanupContent(content) {
    let out = content;

    // 1. Fix deeply stacked group/peer/not prefixes (3+ msp- before these)
    //    e.g., msp-msp-msp-msp-group-data- → group-data-
    //    e.g., msp-msp-msp-msp-not( → not(
    out = out.replace(/(?:msp-){3,}(group-|peer-)/g, '$1');
    out = out.replace(/(?:msp-){3,}not\(/g, 'not(');

    // 2. Fix incorrectly prefixed group-* variants (1+ msp- before group-)
    //    group-hover, group-focus, group-data-[...], etc. should never be prefixed.
    //    But msp-group (standalone utility) should stay — it has NO dash after 'group'.
    //    The pattern requires a dash after 'group', so 'msp-group ' (space) is safe.
    out = out.replace(/(?:msp-)+group-/g, 'group-');

    // 3. Fix incorrectly prefixed peer-* variants
    out = out.replace(/(?:msp-)+peer-/g, 'peer-');

    // 4. Fix broken has-[: content (e.g., has-[:msp-disabled] → has-[:disabled])
    //    This happens because colon splitting inside brackets was not bracket-aware.
    out = out.replace(/has-\[:(?:msp-)+([^\]]*)\]/g, 'has-[:$1]');

    // 5. Fix broken [&:has( patterns (e.g., [&:msp-has( → [&:has()
    out = out.replace(/\[&:(?:msp-)+has\(/g, '[&:has(');

    // 6. Fix double-negative-prefix: -msp-msp-mt-4 → -msp-mt-4
    //    Apply multiple times via a loop for any remaining stacking.
    while (out.includes('-msp-msp-')) {
        out = out.replace(/-msp-msp-/g, '-msp-');
    }

    // 7. Fix remaining double-prefix: msp-msp-flex → msp-flex
    while (out.includes('msp-msp-')) {
        out = out.replace(/msp-msp-/g, 'msp-');
    }

    return out;
}

const dirs = [
    join(ROOT, 'src', 'components'),
    join(ROOT, 'src', 'context'),
    join(ROOT, 'src', 'pages'),
];
const singleFiles = [
    join(ROOT, 'src', 'App.tsx'),
];

const files = [
    ...dirs.flatMap(d => findFiles(d, ['.tsx', '.ts'])),
    ...singleFiles,
];

let changed = 0;
let skipped = 0;

for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const cleaned = cleanupContent(original);
    if (cleaned !== original) {
        writeFileSync(file, cleaned, 'utf8');
        console.log(`  ✓  ${file.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
        changed++;
    } else {
        skipped++;
    }
}

console.log(`\nDone. ${changed} files cleaned, ${skipped} unchanged.`);
