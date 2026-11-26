import { Card } from '@/components/ui/layout/Card';
import type { GradeRow } from '@/types/assessments/gradebook';

export const stages = [
    ['entered', 'Entered', 'Scores recorded by the lecturer'],
    ['moderation', 'In moderation', 'Second marker reviewing'],
    ['approved', 'Approved', 'Signed off by the officer'],
    ['published', 'Published', 'Visible to students'],
];

export function Moderation({ rows, filter }: {
    rows: GradeRow[];
    filter: (value: string) => void;
}) {
    return (
        <div className="space-y-5">
            <Card
                title="Result workflow"
                subtitle="A score becomes a released result only after moderation and approval"
            >
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {stages.map(([id, label, hint]) => (
                        <button
                            key={id}
                            className="rounded-xl border border-ink-100 p-4 text-left hover:bg-ink-50"
                            onClick={() => filter(id)}
                        >
                            <small className="uppercase">{label}</small>
                            <strong className="my-2 block text-2xl">
                                {rows.filter((r) => r.state === id).length}
                            </strong>
                            <small>{hint}</small>
                        </button>
                    ))}
                </div>
            </Card>
            <Card title="Moderation rules">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <strong>Automatic flags</strong>
                        <ul className="list-disc space-y-2 pl-5 text-sm">
                            <li>Score differs from the section mean by more than 15 points.</li>
                            <li>Total changed by more than 10 points after entry.</li>
                            <li>Continuous assessment exceeds the configured weight.</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Release controls</strong>
                        <ul className="list-disc space-y-2 pl-5 text-sm">
                            <li>Only an authorised officer can publish a result.</li>
                            <li>Publishing locks the result.</li>
                            <li>A later correction requires a new approved version.</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}
