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

const low = { label: 'Group A', count: 4, color: 'bg-red-500', upperExclusive: 25 };
const borderline = { label: 'Group B', count: 3, color: 'bg-amber-500', upperExclusive: 50 };
const higher = { label: 'Group C', count: 11, color: 'bg-blue-500', upperExclusive: 51 };
const open = { label: 'Group D', count: 20, color: 'bg-green-500', upperExclusive: null };

for (const [scenario, bands, expected] of [
    ['unordered bands', [higher, low, borderline, open], 7],
    ['reordered bands', [open, borderline, higher, low], 7],
    ['no qualifying band', [open, higher], null],
    ['an empty distribution', [], null],
    ['a qualifying band with no students', [{ ...low, count: 0 }, higher], 0],
    ['zero total students', [{ ...borderline, count: 0 }], 0],
]) {
    test(`attendance below 50% is reported accurately for ${scenario}`, async () => {
        const { AttendanceDistribution } = await server.ssrLoadModule(
            '/resources/js/components/assessments/attendance/AttendanceDistribution.tsx',
        );
        const html = renderToStaticMarkup(createElement(AttendanceDistribution, { bands }));
        assert.deepEqual([...html.matchAll(/>(\d+) students below 50%</g)].map(match => Number(match[1])),
            expected === null ? [] : [expected]);
        assert.equal(html.includes('No attendance distribution available.'), bands.length === 0);
        assert.doesNotMatch(html, /(?:NaN|Infinity)%/);
    });
}

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
