import { Link } from '@inertiajs/react';
import type { Activity } from './Courses/Show';
import { SequenceEditor } from './SequenceEditor';

const categories = { Lesson: 'Lessons', Class: 'Classes', Assignment: 'Assignments', Discussion: 'Discussions' };

export function TeachingOutline({ base, draft, activities }: { base: string; draft: boolean; activities: Activity[] }) {
    return (
        <>
            <section className="course-panel course-pad">
                <h2>Course activity summary</h2>
                <dl className="course-metrics">
                    {Object.entries(categories).map(([type, label]) => (
                        <div key={type}>
                            <dt>{label}</dt>
                            <dd>{activities.filter((activity) => activity.type === type).length}</dd>
                        </div>
                    ))}
                </dl>
            </section>
            <h2>Course outline</h2>
            <nav className="course-actions" aria-label="Course preparation">
                {draft && (
                    <Link className="course-action" href={`${base}/learning/teaching-plan`}>
                        Teaching plan and academic review
                    </Link>
                )}
                <Link className="course-action" href={`${base}/learning?compose=overview`}>
                    Draft a course introduction
                </Link>
            </nav>
            {activities.length > 1 && (
                <SequenceEditor
                    key={activities.map((activity) => activity.id).join(',')}
                    activities={activities}
                    action={`${base}/learning/sequence`}
                />
            )}
        </>
    );
}
