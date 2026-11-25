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
        <main className="mx-auto w-full min-w-0 max-w-4xl space-y-6 px-4 py-6 wrap-anywhere sm:px-6 lg:py-10">
            <Head title="Examinations office" />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">Academic administration</p>
                <h1 className="text-3xl font-semibold tracking-tight">Examinations office</h1>
                <p>Choose an offering to configure its grading policy or review result revisions.</p>
            </header>
            {!offerings.data.length && <p>No course offerings are available.</p>}
            <ul className="divide-y">
                {offerings.data.map((o) => (
                    <li key={o.href} className="py-3">
                        <Link className="text-primary underline underline-offset-4" href={o.href}>{o.title && `${o.title} · `}{o.code}</Link>
                    </li>
                ))}
            </ul>
            <nav aria-label="Offering pages" className="flex flex-wrap gap-x-5 gap-y-2">
                {offerings.prev_page_url && <Link className="text-primary underline underline-offset-4" href={offerings.prev_page_url}>Previous offerings</Link>}
                {offerings.next_page_url && <Link className="text-primary underline underline-offset-4" href={offerings.next_page_url}>Next offerings</Link>}
            </nav>
        </main>
    );
}
