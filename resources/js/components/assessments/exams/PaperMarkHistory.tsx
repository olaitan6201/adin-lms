import { CourseDisclosure } from '@/components/learning/CourseDisclosure';

export type MarkRevision = {
    revision: number;
    reason: string;
    awards: {
        position: number;
        maximum: string;
        points: string;
    }[];
};

export function PaperMarkHistory({ history }: { history: MarkRevision[] }) {
    return (
        <section className="min-w-0 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Mark history</h2>
            {history.map((h) => (
                <CourseDisclosure key={h.revision} label={`Score revision ${h.revision} · ${h.reason}`}>
                    <ol>
                        {h.awards.map((a) => (
                            <li key={a.position}>
                                Question {a.position}: {a.points} / {a.maximum}
                            </li>
                        ))}
                    </ol>
                </CourseDisclosure>
            ))}
        </section>
    );
}
