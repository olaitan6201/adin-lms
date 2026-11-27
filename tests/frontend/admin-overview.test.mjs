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
        server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    });
});
after(() => server?.close());

async function renderOverviewComponent(file, name, props) {
    const components = await server.ssrLoadModule(`/resources/js/components/overview/${file}.tsx`);

    return renderToStaticMarkup(createElement(components[name], props));
}

test('missing completion is labelled without masking a recorded zero', async () => {
    const html = await renderOverviewComponent('OverviewParts', 'Tiles', {
        items: [
            { label: 'Registrations completed', value: null, deltaLabel: 'Current registrations', icon: 'layers' },
            { label: 'Published offerings', value: '0', deltaLabel: 'Currently published', icon: 'book' },
        ],
    });
    const articles = html.match(/<article\b.*?<\/article>/g) ?? [];
    assert.equal(articles.length, 2);
    assert.match(articles[0], /Registrations completed.*?Not available/);
    assert.match(articles[1], /Published offerings.*?>0</);
    assert.doesNotMatch(articles[1], /Not available/);
});

test('restricted examination readiness does not imply zero questions', async () => {
    const html = await renderOverviewComponent('ExamReadiness', 'ExamReadiness', {
        available: false,
        bank: [],
        exams: [],
        subtitle: 'Examination management access is required.',
    });
    assert.match(html, /Examination management access is required/);
    assert.doesNotMatch(html, /Bank coverage|Questions|No upcoming examinations/);
});

test('accessible examination readiness distinguishes an empty bank and schedule from restricted access', async () => {
    const html = await renderOverviewComponent('ExamReadiness', 'ExamReadiness', {
        available: true,
        bank: [],
        exams: [],
        subtitle: 'Latest question-bank revisions.',
    });
    assert.match(html, /No upcoming examinations/);
    assert.match(html, /Bank coverage.*?>0<.*?>Questions</);
    assert.doesNotMatch(html, /access is required/);
});

test('same-title examinations render as two distinct offerings', async () => {
    const html = await renderOverviewComponent('ExamReadiness', 'ExamReadiness', {
        available: true,
        bank: [{ label: 'Objective', value: 2, color: '#10B981' }],
        exams: [
            { id: '01972f10-a1c4-7cb1-87e3-d93bc092a2cb', title: 'Final exam', meta: 'Offering A', status: 'Scheduled' },
            { id: '01972f10-a1c4-7cb1-87e3-d93bc092a2cc', title: 'Final exam', meta: 'Offering B', status: 'Open' },
        ],
        subtitle: 'Published offerings.',
    });
    assert.equal([...html.matchAll(/>Final exam</g)].length, 2);
    assert.match(html, /Offering A.*?Scheduled/);
    assert.match(html, /Offering B.*?Open/);
});

test('faculty completion uses a fixed percentage scale even without a 100% comparison row', async () => {
    const items = [
        { id: 'arts', label: 'Arts', value: 40, color: '#10B981' },
        { id: 'education', label: 'Education', value: 0, color: '#3B82F6' },
        { id: 'sciences', label: 'Sciences', value: 100, color: '#33475F' },
    ];

    for (const comparison of [items.slice(0, 2), items]) {
        const html = await renderOverviewComponent('PercentageBars', 'PercentageBars', { items: comparison });
        assert.match(html, /Arts.*?width:40%.*?>40%</);
        assert.match(html, /Education.*?width:0%.*?>0%</);
        if (comparison.length === 3) {
            assert.match(html, /Sciences.*?width:100%.*?>100%</);
        }
    }
});
