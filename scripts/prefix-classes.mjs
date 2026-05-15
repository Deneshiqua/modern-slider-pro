#!/usr/bin/env node
/**
 * Adds 'msp-' prefix to all Tailwind utility class names in TSX/TS source files.
 * Run once before publishing: node scripts/prefix-classes.mjs
 *
 * Rules:
 *  - Responsive/state variants (hover:, md:, dark:, etc.) stay as-is
 *  - Group/peer variants (group-hover, peer-checked) ARE prefixed (they're utilities)
 *  - Negative utilities: -mt-4  →  -msp-mt-4
 *  - Important modifier: !flex  →  !msp-flex
 *  - Multi-word class strings are fully transformed
 *  - Single-word strings are transformed only in className="" and cn() contexts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PREFIX = 'msp-';

// ──────────────────────────────────────────────────────────────
// Simple recursive glob replacement (no external dep)
// ──────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
// Tailwind built-in variants that do NOT get the prefix
// ──────────────────────────────────────────────────────────────
const BUILTIN_VARIANTS = new Set([
    'sm', 'md', 'lg', 'xl', '2xl',
    'hover', 'focus', 'active', 'disabled', 'checked',
    'visited', 'target', 'focus-within', 'focus-visible',
    'first', 'last', 'only', 'odd', 'even', 'empty',
    'required', 'valid', 'invalid', 'read-only', 'open', 'not',
    'before', 'after', 'placeholder', 'file', 'marker',
    'selection', 'first-line', 'first-letter', 'backdrop',
    'dark', 'light', 'print', 'ltr', 'rtl',
    'motion-safe', 'motion-reduce', 'contrast-more', 'contrast-less',
    'first-of-type', 'last-of-type', 'only-of-type',
    'in-range', 'out-of-range', 'placeholder-shown', 'autofill',
    'portrait', 'landscape', 'forced-colors', 'indeterminate', 'enabled',
]);

function isBuiltinVariant(v) {
    if (BUILTIN_VARIANTS.has(v)) return true;
    // Pseudo-classes and pseudo-elements (CSS syntax) — NEVER prefix these
    if (v.startsWith(':')) return true;
    // Group and peer variants (group-hover, peer-checked, group-[.class], peer-[...], etc.)
    // These are variant modifiers — never prefixed.
    if (/^(group|peer)(-|$)/.test(v)) return true;
    // Already prefixed variant — do not double-prefix
    if (v.startsWith(PREFIX)) return true;
    // Arbitrary variants: aria-[...], data-[...], supports-[...], has-[...], not-[...], etc.
    if (/^(aria|data|supports|not|has|is|where)[-[]/.test(v)) return true;
    // Responsive arbitrary: min-[...], max-[...]
    if (/^(min|max)-\[/.test(v)) return true;
    // Arbitrary value as variant: [...]
    if (v.startsWith('[')) return true;
    return false;
}

function prefixUtility(util) {
    if (!util || util.startsWith(PREFIX)) return util;
    if (/[A-Z]/.test(util)) return util;          // uppercase → not a Tailwind utility
    if (util.includes('://')) return util;         // URL fragments
    if (util.startsWith('[')) return util;         // arbitrary property [--var:val]
    if (util.startsWith('-')) {
        // Idempotent: -msp-mt-4 → unchanged
        if (util.slice(1).startsWith(PREFIX)) return util;
        return '-' + PREFIX + util.slice(1);
    }
    if (util.startsWith('!')) {
        // Idempotent: !msp-flex → unchanged
        if (util.slice(1).startsWith(PREFIX)) return util;
        return '!' + PREFIX + util.slice(1);
    }
    return PREFIX + util;
}

/**
 * Split a class token on ':' but only at depth=0 (outside brackets/parens).
 * This correctly handles: data-[state=open]:flex, [&:has([...]]):flex, etc.
 */
function splitVariantsFromToken(token) {
    const parts = [];
    let depth = 0;
    let current = '';
    for (const ch of token) {
        if (ch === '[' || ch === '(') { depth++; current += ch; }
        else if (ch === ']' || ch === ')') { depth--; current += ch; }
        else if (ch === ':' && depth === 0) { parts.push(current); current = ''; }
        else { current += ch; }
    }
    parts.push(current);
    return parts;
}

function transformToken(token) {
    if (!token || !token.trim()) return token;

    // CSS selector syntax (e.g., &>span:last-child from [&>span:last-child])
    // These should not be transformed like Tailwind classes — return as-is
    if (token.includes('&')) return token;

    const parts = splitVariantsFromToken(token);
    const utility = parts.pop();
    const variants = parts;

    // Variants are never prefixed (hover, focus, group-hover, data-[...], etc.)
    // isBuiltinVariant returns true for group-*, peer-*, already-prefixed, etc.
    const prefixedVariants = variants.map(v =>
        isBuiltinVariant(v) ? v : PREFIX + v
    );

    return [...prefixedVariants, prefixUtility(utility)].join(':');
}

/**
 * Transform a whitespace-separated class string.
 * Preserves existing whitespace (newlines, multiple spaces etc.)
 */
function transformClassStr(str) {
    return str.replace(/\S+/g, transformToken);
}

/**
 * Returns true when every space-separated token in 'str' looks like
 * a valid Tailwind class (lowercase, dash-separated, optional variant prefix).
 */
// Matches a single Tailwind utility token (after stripping variant prefixes).
// Deliberately lenient for arbitrary values which can contain %, (), =, etc.
const CLASS_TOKEN_RE = /^[!-]?(?:[a-z][\w/-]*(?:\[.*?\])?|\[.*?\])$/;

function looksLikeClassString(str) {
    const trimmed = str.trim();
    if (!trimmed) return false;
    // Quick rejection: strings with template syntax or JS operators are not class strings
    if (trimmed.includes('{') || trimmed.includes('}')) return false;
    if (trimmed.includes('=>') || trimmed.includes('===')) return false;
    return trimmed.split(/\s+/).every(token => {
        if (!token) return false;
        // Strip leading variant prefixes (bracket-aware)
        const parts = splitVariantsFromToken(token);
        const utility = parts[parts.length - 1];
        if (!utility) return false;
        return CLASS_TOKEN_RE.test(utility);
    });
}

// ──────────────────────────────────────────────────────────────
// Main file transformer
// ──────────────────────────────────────────────────────────────
function transformFile(content) {
    let out = content;

    // 1. className="..." or className='...'
    //    Transform the entire value (can be multi or single-word).
    out = out.replace(
        /\bclassName=["']([^"']*)["']/g,
        (_, val) => `className="${transformClassStr(val)}"`
    );

    // 2. className={`template literal`}  — only transform literal parts, not ${...} expressions
    out = out.replace(
        /\bclassName=\{`([^`]*)`\}/g,
        (_, val) => {
            // Split on ${...} expression blocks (handles simple non-nested expressions)
            const parts = val.split(/(\$\{[^}]*\})/g);
            const result = parts.map((part, i) =>
                // Even indices are literal text, odd are ${...} expressions
                i % 2 === 0 ? transformClassStr(part) : part
            ).join('');
            return `className={\`${result}\`}`;
        }
    );

    // 3. className={"..."} or className={'...'}
    out = out.replace(
        /\bclassName=\{["']([^"']*)["']\}/g,
        (_, val) => `className={"${transformClassStr(val)}"}`
    );

    // 4. Multi-word quoted strings that look entirely like CSS classes.
    //    This catches cn("flex items-center"), cva variant values, etc.
    //    We deliberately skip single-word strings here to avoid transforming
    //    variant option identifiers in defaultVariants.
    out = out.replace(
        /["']([^"'\n]{4,})["']/g,
        (match, val) => {
            const trimmed = val.trim();
            if (trimmed.split(/\s+/).length < 2) return match; // single word → skip
            if (!looksLikeClassString(trimmed)) return match;
            const quote = match[0];
            return quote + transformClassStr(val) + quote;
        }
    );

    return out;
}

// ──────────────────────────────────────────────────────────────
// Process files
// ──────────────────────────────────────────────────────────────
const dirs = [
    join(ROOT, 'src', 'components'),
    join(ROOT, 'src', 'context'),
    join(ROOT, 'src', 'pages'),
];
const singleFiles = [
    join(ROOT, 'src', 'lib', 'utils.ts'),
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
    const transformed = transformFile(original);
    if (transformed !== original) {
        writeFileSync(file, transformed, 'utf8');
        console.log(`  ✓  ${file.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
        changed++;
    } else {
        skipped++;
    }
}

console.log(`\nDone. ${changed} files transformed, ${skipped} unchanged.`);
