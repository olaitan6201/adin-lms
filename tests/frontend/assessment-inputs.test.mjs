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
        server: { middlewareMode: true, hmr: false, watch: null },
    });
});
after(() => server?.close());

for (const [view, dataset, name, empty] of [
    ['CbtDesk', 'cbt', 'cbtDesk', { questionBanks: [], exams: [] }],
    ['AttendanceDesk', 'attendance', 'attendanceDesk', { attendanceSessions: [] }],
    ['StudentAssignments', 'studentAssignments', 'studentAssignments', { work: [], assignments: [] }],
]) {
    test(`${view} renders an empty collection without selecting a substitute record`, async () => {
        const { default: View } = await server.ssrLoadModule(`/resources/js/components/assessments/${view}.tsx`);
        const data = await server.ssrLoadModule(`/resources/js/data/assessments/${dataset}.ts`);
        const html = renderToStaticMarkup(createElement(View, { ...data[name], ...empty }));
        assert.match(html, /No records to display/);
        assert.doesNotMatch(html, /<dialog\b/);
    });
}
