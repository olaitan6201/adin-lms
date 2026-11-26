import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parseSync } from 'vite';

const root = fileURLToPath(new URL('../../resources/js/', import.meta.url));
function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const path = join(dir, entry.name);
        return entry.isDirectory() ? walk(path) : [path];
    });
}
const files = walk(root);
const sources = files.filter(f => /\.[jt]sx?$/.test(f));

function dependencies(file) {
    const code = readFileSync(file, 'utf8');
    const { program, errors, module } = parseSync(file, code);
    assert.equal(errors.length, 0, `Cannot inspect imports in ${relative(root, file)}`);
    const imports = new Set();
    for (const node of program.body) {
        if (!node.source || node.importKind === 'type' || node.exportKind === 'type') continue;
        if (node.specifiers?.length && node.specifiers.every(spec => spec.importKind === 'type' || spec.exportKind === 'type')) continue;
        imports.add(node.source.value);
    }
    for (const dynamic of module.dynamicImports) {
        const specifier = code.slice(dynamic.moduleRequest.start, dynamic.moduleRequest.end);
        if (/^(['"]).*\1$/.test(specifier)) imports.add(specifier.slice(1, -1));
    }
    return [...imports].flatMap(specifier => {
        if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return [];
        const base = specifier.startsWith('@/') ? join(root, specifier.slice(2)) : resolve(dirname(file), specifier);
        return [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')].filter(f => sources.includes(f));
    });
}

test('styles live in resources/css and pages and components have a category', () => {
    assert.deepEqual(files.map(f => relative(root, f)).filter(f =>
        /\.(css|scss|sass|less)$/.test(f) || /^(pages|components)\/[^/]+\.[jt]sx?$/.test(f)), []);
});

test('reusable UI cannot reach sample records directly or through another module', () => {
    const graph = new Map(sources.map(f => [f, dependencies(f)]));
    const violations = [];
    for (const entry of sources.filter(f => /^(components|hooks|layouts)\//.test(relative(root, f)))) {
        const seen = new Set();
        function inspect(file, chain) {
            if (seen.has(file)) return;
            seen.add(file);
            if (relative(root, file).startsWith('data/')) {
                violations.push(chain.map(p => relative(root, p)).join(' → '));
                return;
            }
            for (const imported of graph.get(file) ?? []) inspect(imported, [...chain, imported]);
        }
        inspect(entry, [entry]);
    }
    assert.deepEqual(violations, []);
});

test('the data tree contains no React views and imports no UI modules', () => {
    assert.ok(existsSync(join(root, 'data')));
    const data = sources.filter(f => relative(root, f).startsWith('data/'));
    const invalid = data.filter(f => /\.tsx$/.test(f) || dependencies(f).some(d =>
        /^(components|pages|layouts)\//.test(relative(root, d))));
    assert.deepEqual(invalid.map(f => relative(root, f)), []);
});
