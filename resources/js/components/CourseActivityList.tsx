import { Link } from '@inertiajs/react';
import type { Activity } from '../pages/Course';
import { LearnerTime } from './LearnerTime';

export function CourseActivityList({ activities }: { activities: Activity[] }) {
    return (
        <ol className="activity-sequence">
            {activities.map((a, i) => (
                <li key={a.id}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                        <small>
                            {a.type} · {a.complete ? 'Completed' : a.detail}
                        </small>
                        <Link href={a.href}>{a.title}</Link>
                        {a.at && (
                            <p className="desk-note">{a.dateLabel}: <LearnerTime instant={a.at} /></p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}
