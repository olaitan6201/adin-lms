import { RegistryPanel } from '@/components/academics/RegistryPanel';
import { DeskHeading } from '@/components/academics/DeskHeading';
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

function Partners({ links }: Pick<Props, 'links'>) {
    return <ul className="grid gap-3">
        {links.map(link => <li key={link.href} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-4">
            <div>
                <a href={link.href} rel="noreferrer" className="link text-[13.5px] font-semibold">{link.label}</a>
                <p className="mt-1 font-mono text-xs text-ink-500">{link.host}</p>
            </div>
            <span aria-hidden="true" className="text-ink-500">↗</span>
        </li>)}
    </ul>;
}

export default function Resources({ course, back, links, tools }: Props) {
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title={`Course partners · ${course}`} />
            <Link href={back} className="underline">
                Course overview
            </Link>
            <DeskHeading area={course} title="Course partners">Learning tools and digital libraries available in this course.</DeskHeading>
            <div className="grid items-start gap-5 lg:grid-cols-2">
                <RegistryPanel title="Learning tools">
                    {tools.length ? <Partners links={tools} /> : <p>No learning tools are available for your role in this course.</p>}
                </RegistryPanel>
                <RegistryPanel title="Digital libraries">
                    {links.length ? (
                        <>
                            <p>Choose a library to leave the course. The library may ask you to sign in separately.</p>
                            <Partners links={links} />
                        </>
                    ) : (
                        <p>No digital libraries are available for your role in this course.</p>
                    )}
                </RegistryPanel>
            </div>
        </main>
    );
}
