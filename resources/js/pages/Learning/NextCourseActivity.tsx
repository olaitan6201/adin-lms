import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import type { Activity } from '../Course';

export function NextCourseActivity({ activities }: { activities: Activity[] }) {
    const lessons = activities.filter((a) => a.type === 'Lesson');
    const next =
        lessons.find((lesson) => !lesson.complete && !lesson.locked) ??
        activities.find((a) => a.actionable) ??
        lessons.find((lesson) => !lesson.complete);
    const completed = lessons.filter((a) => a.complete).length;
    if (!next && !lessons.length) return null;

    return (
        <Card>
            <CardContent className="grid gap-3">
                <Badge variant="secondary">{next ? `Up next / ${next.type}` : 'Progress'}</Badge>
                <h2 className="text-xl font-semibold">{next?.title ?? 'Reading complete'}</h2>
                {next?.locked && <p>{next.detail}</p>}
                {next?.readingPreview && <p className="whitespace-pre-line">{next.readingPreview}</p>}
                {lessons.length > 0 && (
                    <>
                        <p>
                            {completed} of {lessons.length} listed lessons complete
                        </p>
                        <progress aria-label="Listed lessons completed" max={lessons.length} value={completed} />
                    </>
                )}
                {next && (
                    <Button asChild>
                        <Link href={next.href}>Open {next.type.toLowerCase()} →</Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
