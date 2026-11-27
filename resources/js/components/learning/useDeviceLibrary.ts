import { useEffect, useState } from 'react';
import { prepareLibrary, removeFile, savedDates, type StudyFile } from './deviceFiles';

const storageUnavailable = 'Device storage is unavailable. Direct downloads are still available online.';

export function useDeviceLibrary(files: readonly StudyFile[], initialDates: Record<string, string>) {
    const [dates, setDates] = useState<Record<string, string>>({});
    const [error, setError] = useState('');

    async function refresh() {
        try {
            setDates(await savedDates(files));
            setError('');
        } catch {
            setError(storageUnavailable);
        }
    }

    useEffect(() => {
        let active = true;

        async function loadLibrary() {
            try {
                await prepareLibrary(files, initialDates);
                const loaded = await savedDates(files);
                if (active) {
                    setDates(loaded);
                }
            } catch {
                if (active) {
                    setError(storageUnavailable);
                }
            }
        }

        void loadLibrary();

        return () => {
            active = false;
        };
    }, [files, initialDates]);

    async function remove(file: StudyFile) {
        try {
            await removeFile(file);
            await refresh();
        } catch {
            setError('Could not remove the device copy.');
        }
    }

    return { dates, error, refresh, remove };
}
