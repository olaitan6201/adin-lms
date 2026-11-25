import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';

interface Props {
    course: string;
    back: string;
    links: {
        label: string;
        host: string;
        href: string;
    }[];
    tools: Props['links'];
}

export default function Resources({ course, back, links, tools }: Props) {
    return (
        <main className="mx-auto w-full max-w-3xl space-y-5 px-5 py-10">
            <Head title={`Course partners · ${course}`} />
            <Link href={back} className="underline">
                Course overview
            </Link>
            <header>
                <p className="text-sm text-muted-foreground">{course}</p>
                <h1 className="text-3xl font-semibold">Course partners</h1>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>
                        <h2>Learning tools</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {tools.length ? (
                        <ul>
                            {tools.map((tool) => (
                                <li key={tool.href}>
                                    <a href={tool.href} rel="noreferrer" className="underline">
                                        {tool.label}
                                    </a>{' '}
                                    · {tool.host}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No learning tools are available for your role in this course.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>
                        <h2>Digital libraries</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {links.length ? (
                        <>
                            <p>Choose a library to leave the course. The library may ask you to sign in separately.</p>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <a href={link.href} rel="noreferrer" className="underline">
                                            {link.label}
                                        </a>
                                        {' · '}
                                        {link.host}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No digital libraries are available for your role in this course.</p>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
