import { Head, Link } from '@inertiajs/react';
import { LearnerTime } from '../components/LearnerTime';
import { ReleasedWork, type Release } from './ReleasedWork';
import './weekline.css';

export type AgendaItem = {
    title: string;
    kind: string;
    context: string;
    at: string | null;
    href: string;
    action: string;
};
export type DeskCourse = { title: string; code: string; href: string };

function WeekStrip({ queue, today }: { queue: AgendaItem[]; today: Date }) {
    const start = new Date(today);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    return (
        <ol aria-label="This week, Monday through Sunday" className="wl-strip">
            {Array.from({ length: 7 }, (_, index) => {
                const date = new Date(start);
                date.setDate(start.getDate() + index);
                const current = date.toDateString() === today.toDateString();
                const items = queue.filter((task) => task.at && new Date(task.at).toDateString() === date.toDateString());
                return (
                    <li key={index} aria-current={current ? 'date' : undefined} className={items.length ? 'wl-booked' : ''}>
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

export function StudyWeek({ name, courses, queue, releases }: {
    name: string; courses: DeskCourse[]; queue: AgendaItem[]; releases: Release[];
}) {
    const today = new Date();
    return (
        <main className="portal-page weekline">
            <Head title="My study desk" />
            <header className="wl-heading">
                <div><p className="portal-kicker">Student planner / {name}</p><h1>My study desk</h1></div>
                <p className="wl-date">{today.toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
            </header>
            <WeekStrip queue={queue} today={today} />
                <section aria-labelledby="agenda-heading">
                    <h2 id="agenda-heading">Your timetable</h2>
                    <p className="desk-note">Up to 12 upcoming or still-open items, in date order.</p>
                    {queue.length ? <ol className="wl-agenda">
                        {queue.map((task, i) => <li key={`${task.href}:${i}`}>
                            <div className="wl-when">{task.at ? <LearnerTime instant={task.at} /> : 'Unscheduled'}</div>
                            <div><small>{task.kind} · {task.context}</small><h3>{task.title}</h3></div>
                            <Link href={task.href} className="desk-link">{task.action}<span aria-hidden="true"> →</span></Link>
                        </li>)}
                    </ol> : <p>No assignments, exams or scheduled classes to show.</p>}
                </section>
            <section className="wl-shelf">
                <h2>Your courses</h2>
                {!courses.length && <p>Your courses appear here after registration is updated.</p>}
                <ul>{courses.map((course) => <li key={course.href}><Link href={course.href}>
                    <small>{course.code}</small><strong>{course.title}</strong>
                </Link></li>)}</ul>
                <Link className="desk-link" href="/courses">Browse my courses →</Link>
            </section>
            <ReleasedWork releases={releases} />
        </main>
    );
}
