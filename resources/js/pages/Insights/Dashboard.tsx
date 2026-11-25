import { StudyDetails, TeachingDetails, type Teaching, type Study } from '../../insights/DeskDetails';
import { ManagementPeriod, ActivitySummary, type Period, type Activity } from '../../insights/ManagementPeriod';
import { workspaceCopy } from '../../insights/workspaceCopy';
import { Head, Link } from '@inertiajs/react';
import { LearnerTime } from '../../components/LearnerTime';
import type { Release } from '../../insights/ReleasedWork';
import { StudyWeek, type AgendaItem, type DeskCourse } from '../../insights/StudyWeek';

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
        <main className="portal-page">
            <Head title={`${audience} dashboard`} />
            <header className="desk-heading">
                <p className="portal-kicker">{audience} dashboard</p>
                <h1 className="portal-title">{desk.title}</h1>
                <p>{desk.lead}</p>
                <div className="desk-owner">{name}</div>
            </header>
            {period && <ManagementPeriod key={`${period.session}:${period.term}`} period={period} />}
            <div className="desk-grid">
                <div>
                    <section aria-labelledby="queue">
                        <h2 className="desk-section" id="queue">
                            {desk.queue}
                        </h2>
                        <p className="desk-note">{desk.hint}</p>
                        {queue.length ? (
                            <ol className="desk-list">
                                {queue.map((task, index) => {
                                    const date = task.at ? new Date(task.at) : null;
                                    return (
                                        <li key={`${task.href}:${index}`}>
                                            <div className="desk-stamp" aria-hidden="true">
                                                <small>
                                                    {date ? date.toLocaleString(undefined, { month: 'short' }) : 'Item'}
                                                </small>
                                                <strong>
                                                    {date ? date.getDate() : String(index + 1).padStart(2, '0')}
                                                </strong>
                                            </div>
                                            <div>
                                                <p className="portal-kicker">{task.kind}</p>
                                                <h3>{task.title}</h3>
                                                <p className="desk-note">{task.context}</p>
                                                {task.at && <LearnerTime className="desk-note" instant={task.at} />}
                                                <Link className="desk-link" href={task.href}>
                                                    {task.action}
                                                    <span aria-hidden="true"> →</span>
                                                </Link>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        ) : (
                            <div className="desk-empty">
                                <p>{desk.empty}</p>
                                <Link className="desk-link" href={desk.url}>
                                    {desk.action} →
                                </Link>
                            </div>
                        )}
                    </section>
                    {teaching && <TeachingDetails teaching={teaching} />}
                    {activity && <ActivitySummary activity={activity} />}
                    {population && <section className="mt-8 border-t pt-5" aria-labelledby="population-title">
                        <h2 className="desk-section" id="population-title">Institution census</h2>
                        <p className="desk-note">Current records, including people and units without course activity.</p>
                        <dl className="my-3 grid grid-cols-2 gap-3">
                            {Object.entries(population).map(([label, count]) => <div key={label}>
                                <dt>{label}</dt><dd className="text-xl font-semibold tabular-nums">{count}</dd>
                            </div>)}
                        </dl>
                        <Link className="desk-link" href="/reports?family=institution-usage">View institution usage</Link>
                    </section>}
                </div>
                <aside className="portal-panel desk-shelf">
                    {tools.length > 0 && (
                        <nav aria-label="Office workspaces" className="mb-6">
                            <h2 className="desk-section">Office workspaces</h2>
                            <ul>
                                {tools.map((tool) => (
                                    <li key={tool.href}>
                                        <Link href={tool.href}>{tool.label} →</Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                    <h2 className="desk-section">{desk.side}</h2>
                    {courses.length ? (
                        <ul>
                            {courses.map((course) => (
                                <li key={course.href}>
                                    <Link href={course.href}>
                                        {course.title}
                                        <small>{course.code}</small>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="desk-note">No courses in your scope.</p>
                    )}
                    <Link className="desk-link" href={desk.url}>
                        {desk.action} →
                    </Link>
                </aside>
            </div>
        </main>
    );
}
