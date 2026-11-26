import { Disclosure } from './Disclosure';
import { InsightPanel, RatioRing } from './InsightPanel';
import { Link } from '@inertiajs/react';
import { LearnerTime } from '@/components/calendar/LearnerTime';

export type Entry = { title: string; context: string | null; href: string; at?: string };
export type Measures = Record<string, number>;
export type Study = { completed: number; available: number; materials: Entry[]; announcements: Entry[] };
export type Teaching = { summary: Measures; members: Entry[]; uploads: Entry[]; assignments: Entry[]; exams: Entry[]; submissions: Entry[]; mean: string | null };

export function Counts({ values }: { values: Measures }) {
    return <dl className="my-3 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr))]">{Object.entries(values).map(([label, count]) => <div className="kpi min-w-0" key={label}>
        <dt className="kpi-label text-ink-600">{label}</dt><dd className="kpi-value tabular-nums">{count.toLocaleString()}</dd>
    </div>)}</dl>;
}

function ReadingList({ title, entries, empty }: { title: string; entries: Entry[]; empty: string }) {
    return <InsightPanel title={title}>
        {entries.length ? <ul className="divide-y">{entries.map((row, i) => <li className="py-2 break-words" key={`${row.href}:${i}`}>
            <Link className="inline-block py-1 underline underline-offset-4" href={row.href}>{row.title}</Link>
            <p className="text-sm text-muted-foreground">{row.context}{row.at && <> · <LearnerTime instant={row.at} /></>}</p>
        </li>)}</ul> : <p className="text-sm text-muted-foreground">{empty}</p>}
    </InsightPanel>;
}

export function StudyDetails({ study }: { study: Study }) {
    return <section className="grid gap-5" aria-label="Course updates">
        <InsightPanel title="Learning progress"><div className="flex items-center gap-5">
            {study.available > 0 && <RatioRing percent={Math.round(100 * study.completed / study.available)} label="Available lessons completed" />}
            <p>{study.available ? `${study.completed} of ${study.available} available lessons completed` : 'No lessons available yet.'}</p>
        </div></InsightPanel>
        <div className="grid gap-5 md:grid-cols-2">
            <ReadingList title="Available lecture materials" entries={study.materials} empty="No released materials yet." />
            <ReadingList title="Recent announcements" entries={study.announcements} empty="No published announcements yet." />
        </div>
    </section>;
}

export function TeachingDetails({ teaching }: { teaching: Teaching }) {
    return <section aria-label="Allocated course activity" className="grid gap-5">
        <div><h2 className="card-title">Across your courses</h2><Counts values={teaching.summary} /></div>
        <InsightPanel title="Published performance"><div className="flex flex-wrap items-center gap-4">
            {teaching.mean !== null && <RatioRing label="Mean final grade" percent={Number(teaching.mean)} />}
            <p className="card-subtitle">{teaching.mean === null ? 'No published final grades for enrolled students yet.' : `Mean final grade: ${teaching.mean}% · latest published grade per registration`}</p>
        </div></InsightPanel>
        <ReadingList title="Upcoming examinations" entries={teaching.exams} empty="No examinations scheduled to open." />
        <ReadingList title="Assignments accepting submissions" entries={teaching.assignments} empty="No assignments are open." />
        <ReadingList title="Recent submissions" entries={teaching.submissions} empty="No submission revisions received." />
        <Disclosure label="Roster and recent uploads">
            <ReadingList title="Registered learners · first five registrations" entries={teaching.members} empty="No registered learners." />
            <ReadingList title="My recent file uploads" entries={teaching.uploads} empty="No file revisions uploaded yet." />
        </Disclosure>
    </section>;
}
