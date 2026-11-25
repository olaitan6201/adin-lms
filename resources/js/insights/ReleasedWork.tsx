import { Link } from '@inertiajs/react';

export type Release = {
    title: string;
    context: string;
    detail: string;
    at: string;
    download: boolean;
    href: string;
};

export function ReleasedWork({ releases }: { releases: Release[] }) {
    return (
        <section className="mt-8 border-t pt-5" aria-labelledby="published-work">
            <h2 className="desk-section" id="published-work">
                Results & feedback
            </h2>
            <p className="desk-note">Latest published course results and returned assignment marks.</p>
            {releases.length ? (
                <ul className="mt-3 divide-y">
                    {releases.map((row) => (
                        <li key={row.href} className="py-3">
                            <h3 className="font-semibold">{row.title}</h3>
                            <p>{row.detail}</p>
                            <p className="desk-note">
                                {row.context} ·{' '}
                                <time dateTime={row.at}>
                                    {new Date(row.at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </time>
                            </p>
                            {row.download ? (
                                <a className="desk-link" href={row.href}>
                                    Download result sheet (JSON)
                                </a>
                            ) : (
                                <Link className="desk-link" href={row.href}>
                                    Read assignment feedback
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3">No released results or feedback yet.</p>
            )}
        </section>
    );
}
