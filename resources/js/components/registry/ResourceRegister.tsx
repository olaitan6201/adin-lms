import type { DragEvent } from 'react';
import type { LibraryResource } from '@/types/registry/content';
import { Icon } from '@/components/icons/Icon';
import { Action } from '@/components/ui/controls/Action';
import { Records, status } from './Records';

type Props = {
    files: LibraryResource[];
    browse: () => void;
    upload: (incoming: FileList) => void;
    onSelect: (id: string) => void;
};

export function ResourceRegister({ files, browse, upload, onSelect }: Props) {
    return (
        <Records
            title="Resources"
            subtitle="Files, links and embeds attached to the course with their access rule"
            tableClass="[&_th:last-child]:w-[110px] [&_td:last-child]:text-right"
            actions={
                <>
                    {status('Upload limit 200 MB')}
                    <Action
                        icon="upload"
                        size="sm"
                        variant="primary"
                        onClick={browse}
                    >
                        Upload resource
                    </Action>
                </>
            }
            columns={['Resource', 'Version', 'Updated', 'Access', '']}
            rows={files.map((file) => [
                <div key="resource" className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-500">
                        <Icon name={file.icon} className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-medium text-ink-800">{file.name}</p>
                        <p className="truncate text-[11px] text-ink-400">
                            {file.type} · {file.size}
                        </p>
                    </div>
                </div>,
                status(file.version, file.version === 'v1' ? 'slate' : 'sky'),
                <span key="updated" className="text-[13px] text-ink-500">
                    {file.updated}
                </span>,
                status(file.access, file.access === 'Open' ? 'emerald' : 'amber'),
                <Action key="details" size="sm" onClick={() => onSelect(file.id)}>
                    Versions
                </Action>,
            ])}
        >
            <ResourceDropZone browse={browse} upload={upload} />
        </Records>
    );
}

function ResourceDropZone({ browse, upload }: Pick<Props, 'browse' | 'upload'>) {
    function dropFiles(event: DragEvent<HTMLButtonElement>) {
        event.preventDefault();
        upload(event.dataTransfer.files);
    }

    return (
        <button
            type="button"
            className="mb-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50 px-6 py-8 text-center hover:border-brand-400 hover:bg-brand-50/40"
            onClick={browse}
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropFiles}
        >
            <span className="rounded-xl bg-white p-2.5 text-ink-500 shadow-sm">
                <Icon name="upload" className="size-5" />
            </span>
            <span className="text-sm font-medium text-ink-700">Drop files to upload</span>
            <span className="text-xs text-ink-400">File types permitted by the upload allow-list, up to 200 MB</span>
        </button>
    );
}
