import { Check, FileText, LockKeyhole } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { Activity } from './contracts';
import { LearnerTime } from '@/components/calendar/LearnerTime';

export function CourseActivityList({ activities }: { activities: Activity[] }) {
    return (
        <ol>
            {activities.map((a) => {
                const Icon = a.complete ? Check : a.locked ? LockKeyhole : FileText;
                return (
                    <li key={a.id} className="course-module">
                        <Icon aria-hidden />
                        <div className="grid min-w-0 gap-1">
                            <small className="course-code">
                                {a.type} · {a.complete ? 'Completed' : a.detail}
                            </small>
                            <Link className="font-medium hover:underline" href={a.href}>
                                {a.title}
                            </Link>
                            {a.at && (
                                <p className="text-sm text-muted-foreground">
                                    {a.dateLabel}: <LearnerTime instant={a.at} />
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
