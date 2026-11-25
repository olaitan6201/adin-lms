import { Counts, StudyDetails, TeachingDetails, type Teaching, type Study } from '../../insights/DeskDetails';
import { ManagementPeriod, ActivitySummary, type Period, type Activity } from '../../insights/ManagementPeriod';
import { workspaceCopy } from '../../insights/workspaceCopy';
import { Head, Link } from '@inertiajs/react';
import { ActionQueue, type AgendaItem } from '../../insights/ActionQueue';
import { Button } from '@/components/ui/button';
import type { Release } from '../../insights/ReleasedWork';
import { StudyWeek, type DeskCourse } from '../../insights/StudyWeek';

type Workspace = keyof typeof workspaceCopy;
type Props = {
    audience: string;
    workspace: Workspace;
    name: string;
    queue: AgendaItem[];
    courses: DeskCourse[];
    releases: Release[];
    period: Period | null;
    activity: Activity | null;
    teaching: Teaching | null;
    study: Study | null;
    population: Record<string, number> | null;
    tools: {
        label: string;
        href: string;
    }[];
};

export default function Dashboard({ audience, workspace, name, queue, courses, releases, tools, population, period, activity, teaching, study }: Props) {
    if (workspace === 'study') {
        return <StudyWeek name={name} courses={courses} queue={queue} releases={releases}>{study && <StudyDetails study={study} />}</StudyWeek>;
    }
    const desk = workspaceCopy[workspace];
    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 p-4 wrap-anywhere md:p-6">
            <Head title={`${audience} dashboard`} />
            <header className="space-y-1">
                <p className="text-sm text-muted-foreground">{audience} dashboard</p>
                <h1 className="text-3xl font-semibold">{desk.title}</h1>
                <p>{desk.lead}</p>
                <div className="text-sm">{name}</div>
            </header>
            {period && <ManagementPeriod key={`${period.session}:${period.term}`} period={period} />}
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-6">
                    <ActionQueue title={desk.queue} hint={desk.hint} empty={desk.empty} items={queue} />
                    {!queue.length && <Button asChild variant="outline"><Link href={desk.url}>{desk.action}</Link></Button>}
                    {period && <section aria-label="Period summary"><h2 className="text-xl font-semibold">Period summary</h2>
                        <Counts values={period.summary} /></section>}
                    {teaching && <TeachingDetails teaching={teaching} />}
                    {activity && <ActivitySummary activity={activity} />}
                    {population && <section className="mt-8 border-t pt-5" aria-labelledby="population-title">
                        <h2 className="text-xl font-semibold" id="population-title">Institution census</h2>
                        <p className="text-sm text-muted-foreground">Current records, including people and units without course activity.</p>
                        <Counts values={population} />
                        <Link className="inline-block py-1 underline underline-offset-4" href="/reports?family=institution-usage">View institution usage</Link>
                    </section>}
                </div>
                <aside className="min-w-0 space-y-3">
                    {tools.length > 0 && (
                        <nav aria-label="Office workspaces" className="mb-6">
                            <h2 className="text-xl font-semibold">Office workspaces</h2>
                            <ul>
                                {tools.map((tool) => (
                                    <li key={tool.href}>
                                        <Link className="inline-block py-2 underline" href={tool.href}>{tool.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                    <h2 className="text-xl font-semibold">{desk.side}</h2>
                    {courses.length ? (
                        <ul>
                            {courses.map((course) => (
                                <li key={course.href}>
                                    <Link className="block py-2 underline" href={course.href}>
                                        {course.title}
                                        <small className="block">{course.code}</small>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No courses in your scope.</p>
                    )}
                    <Link className="inline-block py-1 underline underline-offset-4" href={desk.url}>
                        {desk.action} →
                    </Link>
                </aside>
            </div>
        </main>
    );
}
