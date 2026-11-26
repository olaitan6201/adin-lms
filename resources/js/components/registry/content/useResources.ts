import { useRef, useState, type ChangeEvent } from 'react';
import { val } from '@/components/registry/Records';
import type { LibraryResource } from '@/types/registry/content';

type ResourceOptions = {
    initialResources: LibraryResource[];
    allowed: string[];
    notify: (message: string) => void;
    onUpload: () => void;
};

function extension(name: string) {
    const separator = name.lastIndexOf('.');
    return separator > 0 ? name.slice(separator + 1).toLowerCase() : '';
}

function uploadedResource(file: File): LibraryResource {
    return {
        id: crypto.randomUUID(),
        name: file.name,
        type: extension(file.name).toUpperCase(),
        size: `${Math.ceil(file.size / 1024)} KB`,
        version: 'v1',
        latest: 1,
        updated: 'Just now',
        access: 'Open',
        icon: 'document',
        from: '',
        until: '',
        download: false,
        source: true,
    };
}

export function useResources({ initialResources, allowed, notify, onUpload }: ResourceOptions) {
    const [files, setFiles] = useState(initialResources);
    const [selectedId, selectResource] = useState<string | null>(null);
    const selected = files.find((file) => file.id === selectedId);
    const picker = useRef<HTMLInputElement>(null);

    function upload(incoming: FileList | null) {
        if (!incoming?.length) return;
        const batch = Array.from(incoming);
        if (batch.some((file) => file.size > 200 * 1024 * 1024 || !allowed.includes(extension(file.name)))) {
            notify('Upload rejected. Select an allowed file type no larger than 200 MB.');
            return;
        }

        const additions = batch.map(uploadedResource);
        setFiles((records) => [...records, ...additions]);
        onUpload();
        notify(`${batch.length} resource(s) added`);
    }

    function pickFiles(event: ChangeEvent<HTMLInputElement>) {
        upload(event.currentTarget.files);
        event.currentTarget.value = '';
    }

    function updateSelected(changes: Partial<LibraryResource>) {
        setFiles((records) => records.map((file) => (file.id === selectedId ? { ...file, ...changes } : file)));
    }

    function restore(version: number) {
        updateSelected({ version: `v${version}` });
    }

    function saveAccess(data: FormData) {
        updateSelected({
            from: val(data, 'Visible from'),
            until: val(data, 'Visible until'),
            download: data.has('download'),
            source: data.has('source'),
        });
        notify('Resource access updated');
    }

    return {
        files,
        selected,
        selectResource,
        restore,
        saveAccess,
        close: () => selectResource(null),
        browse: () => picker.current?.click(),
        upload,
        pickFiles,
        picker,
    };
}
