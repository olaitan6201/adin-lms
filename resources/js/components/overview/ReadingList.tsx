import { InsightPanel } from './InsightPanel';
import { Link } from '@inertiajs/react';
import { LearnerTime } from '@/components/calendar/LearnerTime';

import type { Entry } from './DeskDetails';
type ReadingListProps = {
    title: string;
    entries: Entry[];
    empty: string;
};

export function ReadingList({ title, entries, empty }: ReadingListProps) {
    return (
        <InsightPanel title={title}>
            {entries.length ? (
                <ul className="divide-y">
                    {entries.map((row, i) => (
                        <li className="py-2 break-words" key={`${row.href}:${i}`}>
                            <Link className="inline-block py-1 underline underline-offset-4" href={row.href}>
                                {row.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                                {row.context}
                                {row.at && (
                                    <>
                                        {' '}
                                        · <LearnerTime instant={row.at} />
                                    </>
                                )}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">{empty}</p>
            )}
        </InsightPanel>
    );
}
