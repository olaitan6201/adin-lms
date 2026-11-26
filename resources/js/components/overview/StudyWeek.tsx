import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ActionQueue, type AgendaItem } from './ActionQueue';
import { ReleasedWork, type Release } from './ReleasedWork';
import { InsightPanel } from './InsightPanel';
import { BookOpen, CalendarDays, FileCheck2 } from 'lucide-react';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { WeekStrip } from './WeekStrip';

export type DeskCourse = {
    title: string;
    code: string;
    href: string;
};

export function StudyWeek({
    name,
    courses,
    queue,
    releases,
    children,
}: {
    children: React.ReactNode;
    name: string;
    courses: DeskCourse[];
    queue: AgendaItem[];
    releases: Release[];
}) {
    const [today, setToday] = useState(() => new Date());
    useEffect(() => {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const timer = window.setTimeout(() => setToday(new Date()), midnight.getTime() - Date.now());
        return () => window.clearTimeout(timer);
    }, [today]);
    const featured = courses.find((c) => c.code === queue[0]?.context) ?? courses[0];
    return (
        <main className="mx-auto w-full max-w-7xl space-y-5 p-4 wrap-anywhere md:p-6">
            <Head title="My study desk" />
            <DeskHeading area="Study workspace" title="My study desk">
                {name} · {today.toLocaleDateString(undefined, { dateStyle: 'full' })}
            </DeskHeading>
            <dl className="grid gap-3 sm:grid-cols-3">
                {[
                    { label: 'Courses on your desk', value: courses.length, Icon: BookOpen },
                    { label: 'Items coming up', value: queue.length, Icon: CalendarDays },
                    { label: 'Recent releases', value: releases.length, Icon: FileCheck2 },
                ].map(({ label, value, Icon }) => (
                    <div className="kpi" key={label}>
                        <dt className="kpi-label flex items-center justify-between gap-2 text-ink-600">
                            {label}
                            <Icon aria-hidden="true" className="size-8 rounded-lg bg-ink-50 p-2 text-ink-500" />
                        </dt>
                        <dd className="kpi-value">{value}</dd>
                    </div>
                ))}
            </dl>
            <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
                <InsightPanel title="Course workspace" subtitle="Continue with a course on your desk">
                    <p className="mb-1 font-mono text-xs text-brand-700">{featured?.code}</p>
                    <h3 className="font-semibold">{featured?.title ?? 'No registered courses yet'}</h3>
                    {!featured && (
                        <p className="card-subtitle">Your courses appear here after registration is updated.</p>
                    )}
                    <Button asChild className="mt-4">
                        <Link href={featured?.href ?? '/courses'}>
                            {featured ? 'Open course workspace' : 'View my courses'}
                        </Link>
                    </Button>
                </InsightPanel>
                <div className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1">
                    <ActionQueue
                        title="Coming up"
                        hint="Next 12 tasks, in date order"
                        items={queue}
                        empty="No assignments, exams or scheduled classes to show."
                    />
                </div>
                {children}
            </div>
            <InsightPanel title="This week" subtitle="Scheduled items on your desk">
                <WeekStrip queue={queue} today={today} />
            </InsightPanel>
            <div className="grid items-start gap-5 lg:grid-cols-2">
                <InsightPanel title="Your courses">
                    <ul className="divide-y">
                        {courses.map((course) => (
                            <li key={course.href} className="py-2">
                                <Link className="underline underline-offset-4" href={course.href}>
                                    {course.title} · {course.code}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Button asChild variant="outline" className="mt-3">
                        <Link href="/courses">Browse my courses</Link>
                    </Button>
                </InsightPanel>
                <ReleasedWork releases={releases} />
            </div>
        </main>
    );
}
