import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { downloadBlob, storeFile, type StudyFile } from './deviceFiles';

export function SampleDownload({ file, label, onSaved, appearance = 'plain' }: {
    file: StudyFile;
    label: string;
    onSaved?: () => void;
    appearance?: 'plain' | 'labelled' | 'icon' | 'title';
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(false);
    async function download() {
        setBusy(true);
        setError(false);
        try {
            const blob = await storeFile(file);
            downloadBlob(blob, file.filename);
            onSaved?.();
        } catch {
            setError(true);
        } finally {
            setBusy(false);
        }
    }

    return (
        <span>
            <button
                className={appearance === 'title'
                    ? 'block max-w-full truncate text-left font-medium text-ink-800 hover:underline'
                    : `btn btn-sm ${appearance === 'icon' ? 'btn-ghost' : 'btn-outline'}`}
                type="button"
                disabled={busy}
                onClick={download}
                aria-label={appearance === 'icon' || appearance === 'title' ? label : undefined}
            >
                {(appearance === 'labelled' || appearance === 'icon') && <Icon name="download" className="size-4" />}
                {appearance !== 'icon' && <span>{appearance === 'title' ? file.title : label}</span>}
            </button>
            {error && (
                <span role="alert">
                    Could not save a library copy. <a href={file.href} download={file.filename}>Download directly</a>
                </span>
            )}
        </span>
    );
}
