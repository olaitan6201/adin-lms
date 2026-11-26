import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('a reordered, renamed student scope opens the student panel and carries its worksheets', async () => {
    const server = await createServer({
        configFile: false,
        appType: 'custom',
        resolve: { alias: { '@': fileURLToPath(new URL('../../resources/js/', import.meta.url)) } },
        server: { middlewareMode: true, hmr: false, watch: null },
    });
    try {
        const { Reports } = await server.ssrLoadModule('/resources/js/components/reports/Reports.tsx');
        const { reports } = await server.ssrLoadModule('/resources/js/data/reports/reports.ts');
        const scopes = reports.scopes.filter(scope => ['course', 'student'].includes(scope.id))
            .toReversed().map(scope => ({ ...scope, label: `Scope: ${scope.id}` }));
        const html = renderToStaticMarkup(createElement(Reports, { data: { ...reports, scopes } }));
        const activePanel = html.match(/<div\b[^>]*data-state="active"[^>]*role="tabpanel"[^>]*>([\s\S]*?)(?=<div\b[^>]*role="tabpanel"|$)/)?.[1];
        assert.match(activePanel ?? '', /Student progress report/);
        assert.doesNotMatch(activePanel, /Students needing attention/);
        assert.deepEqual(scopes[0].sheets.map(sheet => sheet.title), ['Student progress report', 'Progress by course']);
    } finally {
        await server.close();
    }
});
