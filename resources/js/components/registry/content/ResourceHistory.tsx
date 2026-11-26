import { exportRecords } from '@/components/registry/Desk';
import { status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { LibraryResource } from '@/types/registry/content';

export function ResourceHistory({
    file,
    manuscriptV1,
    versionHistory,
    resourceAuthor,
    restore,
}: {
    file: LibraryResource;
    manuscriptV1?: string;
    versionHistory: {
        date: string;
        size: string;
    }[];
    resourceAuthor: string;
    restore: (version: number) => void;
}) {
    return (
        <Card title="Version history" subtitle="Replacing a file keeps the previous version available">
            <ul className="divide-y divide-ink-100">
                {Array.from({ length: file.latest }, (_, i) => {
                    const version = file.latest - i;
                    const previous = versionHistory[Math.min(i - 1, versionHistory.length - 1)];
                    const date = i === 0 ? file.updated : previous?.date;
                    const size = i === 0 ? file.size : previous?.size;
                    const current = file.version === `v${version}`;
                    return (
                        <li key={version} className="flex items-center justify-between gap-3 py-2">
                            <div>
                                <b className="text-sm">
                                    v{version}
                                    {current ? ' · current' : ''}
                                </b>
                                <p className="text-xs text-ink-500">
                                    {date} · {resourceAuthor} · {size}
                                </p>
                            </div>
                            {current ? (
                                status('In use', 'emerald')
                            ) : version > 1 ? (
                                <Action size="sm" onClick={() => restore(version)}>
                                    Restore
                                </Action>
                            ) : manuscriptV1 ? (
                                <a
                                    className="btn btn-outline btn-sm"
                                    href={manuscriptV1}
                                    download="acc302-week3-v1.pdf"
                                >
                                    Download sample manuscript
                                </a>
                            ) : (
                                <Action
                                    size="sm"
                                    onClick={() => exportRecords(`resource-v${version}`, [{ name: file.name, version }])}
                                >
                                    Download metadata
                                </Action>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
