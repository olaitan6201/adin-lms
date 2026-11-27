import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const src = fileURLToPath(new URL('../../resources/js/', import.meta.url));
let server;
before(async () => {
    server = await createServer({
        configFile: false,
        appType: 'custom',
        resolve: { alias: { '@': src } },
        optimizeDeps: { noDiscovery: true },
        server: { middlewareMode: true, ws: false, watch: null },
    });
});
after(() => server?.close());

async function render(module, name, props) {
    const components = await server.ssrLoadModule(`/resources/js/components/${module}.tsx`);
    return renderToStaticMarkup(createElement(components[name], props));
}

function attribute(tag, name) {
    const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
    assert.ok(match, `Expected ${name} on ${tag}`);
    return match[1];
}

test('ordinary crest URLs remain decorative images, including URLs with a fragment', async () => {
    for (const src of ['/brand/adin/crest.svg', '/other.svg#crest-art']) {
        const html = await render('icons/InstitutionMark', 'InstitutionMark', { source: { kind: 'image', src } });
        const image = html.match(/<img\b[^>]*>/)?.[0];
        assert.ok(image, `Expected an image for ${src}`);
        assert.equal(attribute(image, 'src'), src);
        assert.equal(attribute(image, 'alt'), '');
        assert.doesNotMatch(html, /<use\b/);
    }
});

test('the configured Adin crest references its artwork as a decorative vector', async () => {
    const { shell } = await server.ssrLoadModule('/resources/js/data/navigation/shell.ts');
    const html = await render('icons/InstitutionMark', 'InstitutionMark', { source: shell.brand.crest });
    assert.match(html, /<svg\b[^>]*aria-hidden="true"/);
    assert.match(html, /<use\b[^>]*href="\/brand\/adin\/crest.svg#crest-art"/);
});

function fraction(circle, attr) {
    const length = circle.includes('pathLength=') ? Number(attribute(circle, 'pathLength'))
        : 2 * Math.PI * Number(attribute(circle, 'r'));
    const value = Number(attribute(circle, attr).split(/[ ,]+/)[0]);
    return Math.round(value / length * 1000) / 1000;
}

test('lesson completion uses the supplied percentage for both its label and its stroke', async () => {
    for (const progress of [0, 37, 100]) {
        const html = await render('overview/StudentPanels', 'ContinueLearning', {
            lesson: { code: 'LAB', progress, title: 'Lab', description: '', summary: [] },
            save() {},
        });
        assert.ok(html.includes(`aria-label="LAB lesson progress: ${progress} percent"`));
        assert.ok(html.includes(`>${progress}%<`));
        assert.match(html, /viewBox="0 0 96 96"/);
        const [circle] = html.match(/<circle\b[^>]*stroke-dashoffset=[^>]*>/g) ?? [];
        assert.ok(circle);
        assert.equal(fraction(circle, 'stroke-dashoffset'), (100 - progress) / 100);
    }
});

for (const [module, name, props, label, size] of [
    ['overview/ExamReadiness', 'ExamReadiness', bank => ({ available: true, bank, exams: [], subtitle: '' }), 'Exam bank questions by question type', 108],
    ['reports/ReportCharts', 'Mix', items => ({ items }), 'Learning actions by engagement type', 150],
]) {
    test(`${name} preserves its label, size and segment proportions for normal and sparse data`, async () => {
        for (const [values, expected] of [
            [[1, 3], [[0.25, 0, 'A: 1'], [0.75, -0.25, 'B: 3']]],
            [[1, 0, 3], [[0.25, 0, 'A: 1'], [0.75, -0.25, 'C: 3']]],
            [[0, 2], [[1, 0, 'B: 2']]],
            [[0], []],
            [[], []],
        ]) {
            const items = values.map((value, i) => ({ value, label: 'ABC'[i], color: ['red', 'blue', 'green'][i] }));
            const html = await render(module, name, props(items));
            const svg = html.match(/<svg\b[^>]*role="img"[\s\S]*?<\/svg>/)?.[0];
            assert.ok(svg);
            assert.equal(attribute(svg, 'aria-label'), label);
            assert.equal(attribute(svg, 'viewBox'), `0 0 ${size} ${size}`);
            assert.doesNotMatch(svg, /NaN|Infinity/);
            const arcs = [...svg.matchAll(/(<circle\b[^>]*stroke-dasharray=[^>]*>)<title>([^<]*)<\/title>/g)];
            assert.equal((svg.match(/stroke-dasharray=/g) ?? []).length, expected.length);
            assert.deepEqual(arcs.map(([, circle, title]) => [
                fraction(circle, 'stroke-dasharray'), fraction(circle, 'stroke-dashoffset') || 0, title,
            ]), expected);
        }
    });
}
