import { Field } from '@/components/registry/Desk';
import { Card } from '@/components/ui/layout/Card';
import { ResourceHistory } from './ResourceHistory';
import { PanelForm } from '@/components/registry/DeskPanel';
import type { LibraryResource } from '@/types/registry/content';

export function ResourcePanel({
    file,
    attachedWeek,
    versionHistory,
    resourceAuthor,
    restore,
    saveAccess,
    close,
}: {
    file: LibraryResource;
    attachedWeek: string | undefined;
    versionHistory: { date: string; size: string }[];
    resourceAuthor: string;
    restore: (version: number) => void;
    saveAccess: (data: FormData) => void;
    close: () => void;
}) {
    return (
        <PanelForm
            close={close}
            panel={{
                title: file.name,
                subtitle: `${file.type} · ${file.size}${attachedWeek ? ` · attached to ${attachedWeek}` : ''}`,
                submit: 'Save',
                save: saveAccess,
                body: (
                    <>
                        <ResourceHistory {...{ file, versionHistory, resourceAuthor, restore }} />
                        <Card title="Access and downloads">
                            <div className="space-y-3">
                                <Field label="Visible from" type="date" value={file.from} />
                                <Field label="Visible until" type="date" value={file.until} />
                                <label className="block text-sm">
                                    <input type="checkbox" name="download" defaultChecked={file.download} /> Allow
                                    download on mobile and desktop
                                </label>
                                <label className="block text-sm">
                                    <input type="checkbox" name="source" defaultChecked={file.source} /> Allow
                                    download of the source file, not only the reader view
                                </label>
                            </div>
                        </Card>
                    </>
                ),
            }}
        />
    );
}
