import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import type { Activity } from '../pages/Course';
import { LearnerTime } from './LearnerTime';

export function CourseActivityList({ activities }: { activities: Activity[] }) {
    return (
        <ol className="grid gap-3">
            {activities.map((a, i) => (
                <li key={a.id}>
                    <Separator className="mb-3" />
                    <div className="flex items-start gap-3">
                        <Badge variant="outline" aria-hidden="true">
                            {String(i + 1).padStart(2, '0')}
                        </Badge>
                        <div className="grid min-w-0 gap-1">
                            <small>
                                {a.type} · {a.complete ? 'Completed' : a.detail}
                            </small>
                            <Link className="underline" href={a.href}>
                                {a.title}
                            </Link>
                            {a.at && (
                                <p className="text-sm text-muted-foreground">
                                    {a.dateLabel}: <LearnerTime instant={a.at} />
                                </p>
                            )}
                        </div>
                    </div>
                </li>
            ))}
        </ol>
    );
}
