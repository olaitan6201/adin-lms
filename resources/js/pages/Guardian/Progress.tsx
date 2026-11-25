import { Head, Link } from '@inertiajs/react';

type Props = {
    approvals?: { reference: string; href: string }[];
    previous?: string | null;
    next?: string | null;
    completed_lessons?: number;
};

export default function Progress({ approvals, completed_lessons, previous, next }: Props) {
    return <main className="portal-page">
        <Head title="Shared progress" />
        <header className="desk-heading">
            <p className="portal-kicker">Guardian workspace</p>
            <h1 className="portal-title">Shared progress</h1>
            <p>Lesson completion shared with you by the institution.</p>
        </header>
        {approvals ? <section className="portal-panel desk-shelf mt-6">
            <h2 className="desk-section">Approved records</h2>
            {approvals.length ? <ul>{approvals.map(({ reference, href }) =>
                <li key={href}><Link href={href}>View progress · {reference}<small>Completed lessons</small></Link></li>)}</ul>
                : <p className="desk-empty">No progress records are currently shared with you.</p>}
            <nav aria-label="Records pages">{previous && <Link className="desk-link" href={previous}>Previous records</Link>}
                {next && <Link className="desk-link" href={next}>More records</Link>}</nav>
        </section> : <section className="portal-panel desk-shelf mt-6">
            <h2 className="desk-section">Completed lessons</h2>
            <p className="my-3 font-serif text-5xl">{completed_lessons}</p>
            <p>Across current course registrations.</p>
            <Link className="desk-link" href="/guardian">Back to approved records</Link>
        </section>}
    </main>;
}
