import { useState } from 'react';
import { downloadBlob, storeFile, type StudyFile } from './deviceFiles';

export function SampleDownload({ file, label, onSaved }: {
    file: StudyFile;
    label: string;
    onSaved?: () => void;
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
                className="btn btn-outline btn-sm"
                type="button"
                disabled={busy}
                onClick={download}
            >
                {label}
            </button>
            {error && (
                <span role="alert">
                    Could not save a library copy. <a href={file.href} download={file.filename}>Download directly</a>
                </span>
            )}
        </span>
    );
}
