import { Link } from '@inertiajs/react';

export type Grade = {
    id: string;
    revision: number;
    enrolment_id: string;
    grade: string;
    total_percent: string;
    moderation_status: 'pending' | 'approved' | 'correction_requested';
    published_at: string | null;
    moderation_note: string | null;
};

interface Props {
    grades: Grade[];
    teacher: boolean;
    officer: boolean;
    who: (id: string) => string | undefined;
}

export function ResultRevisions({ grades, teacher, officer, who }: Props) {
    return (
        <section id="result-revisions" className="portal-panel">
            <h2>Result revisions</h2>
            {!grades.length && <p>No results available.</p>}
            {grades.map((g) => (
                <article key={g.id}>
                    <h3>
                        {who(g.enrolment_id) ?? 'Your result'} · Revision {g.revision}
                    </h3>
                    <p>
                        {g.total_percent}% · {g.grade} · {g.published_at ? 'Published' : g.moderation_status}
                    </p>
                    {(teacher || officer) && <p>{g.moderation_note}</p>}
                    {officer && <Link href={`/grades/${g.id}/evidence`}>Inspect marks and moderation history</Link>}
                    {g.published_at && <a href={`/grades/${g.id}/sheet`}>Download published result sheet</a>}
                </article>
            ))}
        </section>
    );
}
