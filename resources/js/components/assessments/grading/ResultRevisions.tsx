import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ResultSheetDownloads } from './ResultSheetDownloads';

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
        <section id="result-revisions" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Result revisions</h2>
            {!grades.length && <p>No results available.</p>}
            {grades.map((g) => (
                <Card key={g.id}>
                    <CardContent className="space-y-3">
                        <h3 className="font-semibold">
                            {who(g.enrolment_id) ?? 'Your result'} · Revision {g.revision}
                        </h3>
                        <p>
                            {g.total_percent}% · {g.grade} ·{' '}
                            {g.published_at ? 'Published' : g.moderation_status}
                        </p>
                        {(teacher || officer) && <p>{g.moderation_note}</p>}
                        {officer && (
                            <Link
                                className="text-primary underline underline-offset-4"
                                href={`/grades/${g.id}/evidence`}
                            >
                                Inspect marks and moderation history
                            </Link>
                        )}
                        {g.published_at && <ResultSheetDownloads href={`/grades/${g.id}/sheet`} />}
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}
