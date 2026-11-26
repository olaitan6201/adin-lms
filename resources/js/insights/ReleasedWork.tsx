import { Link } from '@inertiajs/react';
import { ResultSheetDownloads } from '../assessment/ResultSheetDownloads';
import { InsightPanel } from './InsightPanel';

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
        <InsightPanel title="Results & feedback" subtitle="Latest published course results and returned assignment marks.">
            {releases.length ? (
                <ul className="mt-3 divide-y">
                    {releases.map((row) => (
                        <li key={row.href} className="py-3">
                            <h3 className="font-semibold">{row.title}</h3>
                            <p>{row.detail}</p>
                            <p className="text-sm text-muted-foreground">
                                {row.context} ·{' '}
                                <time dateTime={row.at}>
                                    {new Date(row.at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </time>
                            </p>
                            {row.download ? (
                                <ResultSheetDownloads href={row.href} />
                            ) : (
                                <Link className="inline-block py-1 underline underline-offset-4" href={row.href}>
                                    Read assignment feedback
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3">No released results or feedback yet.</p>
            )}
        </InsightPanel>
    );
}
