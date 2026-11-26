import { Link } from '@inertiajs/react';
import type { ClassReport } from './contracts';

export function StudyGroupProgress({ groups, offeringId }: {
    groups: ClassReport['groups'];
    offeringId: string
}) {
    return (
        <section className="course-panel course-pad space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Study group progress</h2>
            <p className="text-sm text-muted-foreground">Completed lessons across current members of each group.</p>
            {groups.length ? (
                <ul>
                    {groups.map((group) => (
                        <li key={group.id} className="py-3">
                            <strong>{group.name}</strong>
                            <p>
                                {group.members} current members · {group.lessons} lesson completions
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="py-4 text-sm text-muted-foreground">There are no study groups in this offering.</p>
            )}
            <Link className="font-medium text-primary underline underline-offset-4" href={`/community/courses/${offeringId}`}>
                Open course groups
            </Link>
        </section>
    );
}
