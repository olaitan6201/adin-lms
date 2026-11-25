import { Head, Link } from '@inertiajs/react';
import '../../assessment/assessment.css';

type Offerings = {
    data: {
        code: string;
        title: string | null;
        href: string;
    }[];
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function Office({ offerings }: { offerings: Offerings }) {
    return (
        <main className="portal-page assessment-page">
            <Head title="Examinations office" />
            <header className="assessment-heading">
                <p className="portal-kicker">Academic administration</p>
                <h1 className="portal-title">Examinations office</h1>
                <p>Choose an offering to configure its grading policy or review result revisions.</p>
            </header>
            {!offerings.data.length && <p>No course offerings are available.</p>}
            <ul className="assessment-evidence">
                {offerings.data.map((o) => (
                    <li key={o.href}>
                        <Link href={o.href}>{o.title ?? o.code}</Link>
                        <span>{o.code}</span>
                    </li>
                ))}
            </ul>
            <nav aria-label="Offering pages">
                {offerings.prev_page_url && <Link href={offerings.prev_page_url}>Previous offerings</Link>}
                {offerings.next_page_url && <Link href={offerings.next_page_url}>Next offerings</Link>}
            </nav>
        </main>
    );
}
