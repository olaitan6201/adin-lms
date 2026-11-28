import { Link } from '@inertiajs/react';
import type { Choice } from './RecordForm';

export function CoreSelection({ workspace, kind, records, selected, other }: {
    workspace: string;
    kind: 'course' | 'curriculum';
    records: Choice[];
    selected?: string;
    other?: string;
}) {
    const name = kind === 'course' ? 'course' : 'curriculum version';
    const otherKind = kind === 'course' ? 'curriculum' : 'course';

    if (!records.length) {
        return <p className="text-sm text-muted-foreground">No {name} records are available.</p>;
    }

    return (
        <details>
            <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium hover:underline focus-visible:outline-ring">
                Choose {kind === 'course' ? 'a course' : 'a curriculum version'}
            </summary>
            <ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border">
                {records.map((record) => {
                    const query = new URLSearchParams({ [kind]: record.id });
                    if (other) {
                        query.set(otherKind, other);
                    }

                    return (
                        <li key={record.id}>
                            <Link
                                href={`${workspace}?${query}`}
                                preserveScroll
                                preserveState
                                aria-current={record.id === selected ? 'page' : undefined}
                                className="block min-h-11 wrap-anywhere px-3 py-3 text-sm hover:bg-muted focus-visible:outline-ring focus-visible:-outline-offset-2 aria-[current=page]:bg-muted aria-[current=page]:font-semibold"
                            >
                                {record.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </details>
    );
}
