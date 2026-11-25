import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ActionQueue, type AgendaItem } from './ActionQueue';
import { ReleasedWork, type Release } from './ReleasedWork';
export type DeskCourse = { title: string; code: string; href: string };

function WeekStrip({ queue, today }: { queue: AgendaItem[]; today: Date }) {
    const start = new Date(today);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    return (
        <ol aria-label="This week, Monday through Sunday" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => {
                const date = new Date(start);
                date.setDate(start.getDate() + index);
                const current = date.toDateString() === today.toDateString();
                const items = queue.filter((task) => task.at && new Date(task.at).toDateString() === date.toDateString());
                return (
                    <li key={index} aria-current={current ? 'date' : undefined} className="flex flex-col gap-1">
                        <span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                        <strong>{date.getDate()}</strong>
                        <small>{current ? 'Today' : ''}{current && items.length ? ' · ' : ''}
                            {items.length ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : ''}</small>
                    </li>
                );
            })}
        </ol>
    );
}

export function StudyWeek({ name, courses, queue, releases, children }: {
    children: React.ReactNode; name: string; courses: DeskCourse[]; queue: AgendaItem[]; releases: Release[];
}) {
    const today = new Date();
    const featured = courses.find((c) => c.code === queue[0]?.context) ?? courses[0];
    return (
        <main className="mx-auto w-full max-w-6xl space-y-8 p-4 wrap-anywhere md:p-6">
            <Head title="My study desk" />
            <header className="space-y-1">
                <h1 className="text-3xl font-semibold">My study desk</h1>
                <p>{name} · {today.toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
            </header>
            <section aria-label="Course workspace" className="space-y-2">
                <h2 className="text-xl font-semibold">{featured?.title ?? 'No registered courses yet'}</h2>
                <p>{featured?.code ?? 'Your courses appear here after registration is updated.'}</p>
                <Button asChild><Link href={featured?.href ?? '/courses'}>
                    {featured ? 'Open course workspace' : 'View my courses'}
                </Link></Button>
            </section>
            <ActionQueue title="Coming up" hint="Next 12 tasks, in date order" items={queue}
                empty="No assignments, exams or scheduled classes to show." />
            <section className="space-y-3" aria-label="Weekly overview">
                <h2 className="text-xl font-semibold">This week</h2>
                <WeekStrip queue={queue} today={today} />
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Your courses</h2>
                <ul className="divide-y">{courses.map(course => <li key={course.href} className="py-2">
                    <Link className="underline underline-offset-4" href={course.href}>{course.title} · {course.code}</Link>
                </li>)}</ul>
                <Button asChild variant="outline"><Link href="/courses">Browse my courses</Link></Button>
            </section>
            <ReleasedWork releases={releases} />
            {children}
        </main>
    );
}
