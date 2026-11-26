import { Counts, StudyDetails, TeachingDetails, type Teaching, type Study } from '@/components/overview/DeskDetails';
import { ManagementPeriod, ActivitySummary, type Period, type Activity } from '@/components/overview/ManagementPeriod';
import { workspaceCopy } from '@/components/overview/workspaceCopy';
import { Head, Link } from '@inertiajs/react';
import { ActionQueue, type AgendaItem } from '@/components/overview/ActionQueue';
import { Button } from '@/components/ui/button';
import type { Release } from '@/components/overview/ReleasedWork';
import { StudyWeek, type DeskCourse } from '@/components/overview/StudyWeek';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { RegistryFigures, RegistryPanel } from '@/components/academics/RegistryPanel';

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

function WorkspaceSidebar({
    tools,
    courses,
    desk,
}: Pick<Props, 'tools' | 'courses'> & {
    desk: {
        side: string;
        url: string;
        action: string;
    };
}) {
    return (
        <aside className="min-w-0 space-y-3">
            {tools.length > 0 && (
                <RegistryPanel title="Office workspaces">
                    <nav aria-label="Office workspaces">
                        <ul className="divide-y divide-ink-100">
                            {tools.map((tool) => (
                                <li key={tool.href}>
                                    <Link className="inline-block py-2 underline" href={tool.href}>
                                        {tool.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </RegistryPanel>
            )}
            <RegistryPanel title={desk.side}>
                {courses.length ? (
                    <ul className="divide-y divide-ink-100">
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
            </RegistryPanel>
        </aside>
    );
}

export default function Dashboard({
    audience,
    workspace,
    name,
    queue,
    courses,
    releases,
    tools,
    population,
    period,
    activity,
    teaching,
    study,
}: Props) {
    if (workspace === 'study') {
        return (
            <StudyWeek name={name} courses={courses} queue={queue} releases={releases}>
                {study && <StudyDetails study={study} />}
            </StudyWeek>
        );
    }

    const desk = workspaceCopy[workspace];
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title={`${audience} dashboard`} />
            <DeskHeading area={`${audience} dashboard`} title={desk.title}>
                {name} · {desk.lead}
            </DeskHeading>
            {period && <ManagementPeriod key={`${period.session}:${period.term}`} period={period} />}
            {period && (
                <section aria-label="Period summary">
                    <h2 className="sr-only">Period summary</h2>
                    <RegistryFigures values={period.summary} />
                </section>
            )}
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-6">
                    <ActionQueue title={desk.queue} hint={desk.hint} empty={desk.empty} items={queue} />
                    {!queue.length && (
                        <Button asChild variant="outline">
                            <Link href={desk.url}>{desk.action}</Link>
                        </Button>
                    )}
                    {teaching && <TeachingDetails teaching={teaching} />}
                    {activity && <ActivitySummary activity={activity} />}
                    {population && (
                        <RegistryPanel
                            title="Institution census"
                            subtitle="Current records, including people and units without course activity."
                        >
                            <Counts values={population} />
                            <Link className="inline-block py-1 underline underline-offset-4" href="/reports?family=institution-usage">
                                View institution usage
                            </Link>
                        </RegistryPanel>
                    )}
                </div>
                <WorkspaceSidebar tools={tools} courses={courses} desk={desk} />
            </div>
        </main>
    );
}
