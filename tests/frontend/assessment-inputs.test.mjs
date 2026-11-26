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
    ['AssignmentsDesk', 'assignments', 'assignmentDesk', { assignments: [], submissions: [] }],
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

test('an empty exam paper shows no answer controls or attempt receipt', async () => {
    const { default: Exam } = await server.ssrLoadModule('/resources/js/components/assessments/StudentExam.tsx');
    const html = renderToStaticMarkup(createElement(Exam, { paper: [], title: 'Empty paper' }));
    assert.match(html, /No questions are available for this sitting/);
    assert.doesNotMatch(html, /Submit examination|Examination submitted|role="timer"/);
});

test('returning the non-first same-title script counts precisely one assignment, even after a draft', async () => {
    const { recordMark } = await server.ssrLoadModule('/resources/js/components/assessments/assignmentRecords.ts');
    const records = {
        rows: ['a', 'b'].map(id => ({ id, title: 'Essay', submissions: 4, marked: 1 })),
        queue: ['a', 'b'].map(id => ({ id: `script-${id}`, assignmentId: id, status: 'awaiting marking', score: null })),
        awaiting: 6,
    };
    const draft = { ...records.queue[1], status: 'feedback draft', score: 70 };
    const drafted = recordMark(records, draft);
    assert.deepEqual(drafted.rows, records.rows);
    const returned = recordMark(drafted, { ...draft, status: 'feedback returned' });
    assert.deepEqual(returned.rows.map(row => row.marked), [1, 2]);
    assert.equal(returned.awaiting, 5);
    assert.equal(returned.queue[0], records.queue[0]);
    assert.deepEqual(recordMark(returned, returned.queue[1]), returned);
});
