import { Link } from '@inertiajs/react';
import { LearnerTime } from '../components/LearnerTime';

export type Entry = { title: string; context: string | null; href: string; at?: string };
export type Measures = Record<string, number>;
export type Study = { completed: number; available: number; materials: Entry[]; announcements: Entry[] };
export type Teaching = { summary: Measures; members: Entry[]; uploads: Entry[]; assignments: Entry[]; exams: Entry[]; submissions: Entry[]; mean: string | null };

export function Counts({ values }: { values: Measures }) {
    return <dl className="my-3 grid grid-cols-2 gap-3">{Object.entries(values).map(([label, count]) => <div key={label}>
        <dt>{label}</dt><dd className="text-xl font-semibold tabular-nums">{count}</dd>
    </div>)}</dl>;
}

function ReadingList({ title, entries, empty }: { title: string; entries: Entry[]; empty: string }) {
    return <section className="mt-6 border-t pt-4">
        <h2 className="desk-section">{title}</h2>
        {entries.length ? <ul className="divide-y">{entries.map((row, i) => <li className="py-2 break-words" key={`${row.href}:${i}`}>
            <Link className="desk-link" href={row.href}>{row.title}</Link>
            <p className="desk-note">{row.context}{row.at && <> · <LearnerTime instant={row.at} /></>}</p>
        </li>)}</ul> : <p className="desk-note">{empty}</p>}
    </section>;
}

export function StudyDetails({ study }: { study: Study }) {
    return <section className="mt-6" aria-label="Course updates">
        <h2 className="desk-section">Learning progress</h2>
        <p>{study.available ? `${study.completed} of ${study.available} available lessons completed` : 'No lessons available yet.'}</p>
        <div className="grid gap-x-8 md:grid-cols-2">
            <ReadingList title="Available lecture materials" entries={study.materials} empty="No released materials yet." />
            <ReadingList title="Recent announcements" entries={study.announcements} empty="No published announcements yet." />
        </div>
    </section>;
}

export function TeachingDetails({ teaching }: { teaching: Teaching }) {
    return <section aria-label="Allocated course activity" className="mt-8 border-t pt-5">
        <h2 className="desk-section">Across your courses</h2><Counts values={teaching.summary} />
        <p>{teaching.mean === null ? 'No published final grades for enrolled students yet.' : `Mean final grade: ${teaching.mean}% · latest published grade per registration`}</p>
        <ReadingList title="Upcoming examinations" entries={teaching.exams} empty="No examinations scheduled to open." />
        <ReadingList title="Assignments accepting submissions" entries={teaching.assignments} empty="No assignments are open." />
        <ReadingList title="Recent submissions" entries={teaching.submissions} empty="No submission revisions received." />
        <details className="mt-4"><summary>Roster and recent uploads</summary>
            <ReadingList title="Registered learners · first five registrations" entries={teaching.members} empty="No registered learners." />
            <ReadingList title="My recent file uploads" entries={teaching.uploads} empty="No file revisions uploaded yet." />
        </details>
    </section>;
}
