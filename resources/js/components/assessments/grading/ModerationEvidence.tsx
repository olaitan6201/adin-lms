import { CourseDisclosure } from '@/components/learning/CourseDisclosure';

type Input = {
    item: string;
    points: string;
    maximum: string;
    weight: string;
    score_revision: number;
    marker: string | null;
    reason: string;
    criteria: {
        criterion_title: string;
        level_label: string;
        points: string;
        feedback: string | null;
    }[];
};
export type ModerationEvidenceProps = {
    policy: {
        version: number;
        rounding_rule: string;
    };
    inputs: Input[];
    boundaries: {
        grade: string;
        minimum_percent: string;
    }[];
};
export function ModerationEvidence({ inputs, policy, boundaries }: ModerationEvidenceProps) {
    return (
        <section className="min-w-0 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Component marks</h2>
            <p>These are the score revisions used when this result was calculated.</p>
            <ul className="divide-y">
                {inputs.map((input, index) => (
                    <li key={index} className="grid gap-2 py-3 sm:grid-cols-3">
                        <strong>{input.item}</strong>
                        <span>
                            {input.points} / {input.maximum} points
                        </span>
                        <small>
                            Weight {input.weight}% · Score revision {input.score_revision}
                        </small>
                        <CourseDisclosure className="sm:col-span-full" label="Marking record">
                            <p>
                                {input.marker ?? 'Automatic score'} · {input.reason}
                            </p>
                            {input.criteria.map((c) => (
                                <p key={c.criterion_title}>
                                    {c.criterion_title}: {c.level_label}, {c.points} points
                                    {c.feedback && ` · ${c.feedback}`}
                                </p>
                            ))}
                        </CourseDisclosure>
                    </li>
                ))}
            </ul>
            <CourseDisclosure label={`Grading policy · version ${policy.version}`}>
                <p>Rounding: {policy.rounding_rule.replaceAll('_', ' ')}</p>
                <ul>
                    {boundaries.map((b) => (
                        <li key={b.minimum_percent}>
                            {b.grade}: at least {b.minimum_percent}%
                        </li>
                    ))}
                </ul>
            </CourseDisclosure>
        </section>
    );
}
