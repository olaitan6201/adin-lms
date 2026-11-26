import { AssessmentWorkspace } from '../../assessment/AssessmentWorkspace';
import { Head, Link } from '@inertiajs/react';

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
        <AssessmentWorkspace>
            <Head title="Examinations office" />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">Academic administration</p>
                <h1 className="text-3xl font-semibold tracking-tight">Examinations office</h1>
                <p>Choose an offering to configure its grading policy or review result revisions.</p>
            </header>
            <section aria-labelledby="available-offerings">
                <h2 id="available-offerings" className="font-semibold">Course offerings</h2>
                {!offerings.data.length && <p>No course offerings are available.</p>}
                <ul className="divide-y">
                    {offerings.data.map((o) => (
                        <li key={o.href} className="py-3">
                            <Link className="flex items-center justify-between gap-3 text-primary hover:underline" href={o.href}>
                                <span>{o.title && `${o.title} · `}<span className="font-mono text-xs">{o.code}</span></span>
                                <span aria-hidden="true">→</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            <nav aria-label="Offering pages" className="flex flex-wrap gap-x-5 gap-y-2">
                {offerings.prev_page_url && <Link className="text-primary underline underline-offset-4" href={offerings.prev_page_url}>Previous offerings</Link>}
                {offerings.next_page_url && <Link className="text-primary underline underline-offset-4" href={offerings.next_page_url}>Next offerings</Link>}
            </nav>
        </AssessmentWorkspace>
    );
}
