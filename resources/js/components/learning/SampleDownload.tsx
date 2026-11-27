import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { downloadBlob, storeFile, type StudyFile } from './deviceFiles';

export function SampleDownload({ file, label, onSaved, appearance = 'plain' }: {
    file: StudyFile;
    label: string;
    onSaved?: () => void;
    appearance?: 'plain' | 'labelled' | 'icon';
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
                className={`btn btn-sm ${appearance === 'icon' ? 'btn-ghost' : 'btn-outline'}`}
                type="button"
                disabled={busy}
                onClick={download}
                aria-label={appearance === 'icon' ? label : undefined}
            >
                {appearance !== 'plain' && <Icon name="download" className="size-4" />}
                {appearance !== 'icon' && <span>{label}</span>}
            </button>
            {error && (
                <span role="alert">
                    Could not save a library copy. <a href={file.href} download={file.filename}>Download directly</a>
                </span>
            )}
        </span>
    );
}
