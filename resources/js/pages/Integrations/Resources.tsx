import { Head, Link } from '@inertiajs/react';

interface Props {
    course: string;
    back: string;
    links: { label: string; host: string; href: string }[];
}

export default function Resources({ course, back, links }: Props) {
    return (
        <main className="portal-page mx-auto max-w-3xl space-y-5 px-5 py-10">
            <Head title={`Digital libraries · ${course}`} />
            <Link href={back} className="underline">Course overview</Link>
            <header>
                <p className="portal-kicker">{course}</p>
                <h1 className="portal-title">Digital libraries</h1>
            </header>
            {links.length ? <>
                <p>Choose a library to leave the course. The library may ask you to sign in separately.</p>
                <ul className="space-y-3">{links.map(link => (
                    <li key={link.href}>
                        <a href={link.href} rel="noreferrer" className="underline">{link.label}</a>
                        {' · '}{link.host}
                    </li>
                ))}</ul>
            </> : <p>No digital libraries are available for your role in this course.</p>}
        </main>
    );
}
