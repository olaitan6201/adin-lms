export type StudyFile = {
    id: string;
    title: string;
    href: string;
    filename: string;
    bytes: number;
    course: string;
    format: string;
};

const cacheName = 'adin-sample-study-library-v1';

export async function savedDates(files: readonly StudyFile[]) {
    const cache = await caches.open(cacheName);
    const dates: Record<string, string> = {};
    await Promise.all(files.map(async (file) => {
        const response = await cache.match(file.href);
        const date = response?.headers.get('X-Sample-Saved');
        if (date) {
            dates[file.id] = date;
        }
    }));
    return dates;
}

export async function storeFile(file: StudyFile) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(file.href);
    if (cached) {
        return cached.blob();
    }

    const response = await fetch(file.href, { credentials: 'omit' });
    if (!response.ok) {
        throw new Error('File unavailable');
    }
    const blob = await response.blob();
    if (blob.size !== file.bytes) {
        throw new Error('Incomplete sample file');
    }
    await cache.put(file.href, new Response(blob, {
        headers: { 'Content-Type': blob.type, 'X-Sample-Saved': new Date().toISOString() },
    }));
    return blob;
}

export async function removeFile(file: StudyFile) {
    const cache = await caches.open(cacheName);
    await cache.delete(file.href);
}

export function downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
