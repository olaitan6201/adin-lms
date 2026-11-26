import { useState, type FormEvent } from 'react';

export type DraftKind = 'Module' | 'Chapter' | 'Resource' | 'Allocation request';
export type CourseDraft = {
    title: string;
    detail: string;
};

export function CourseDraftForm({ kind, initial, save }: {
    kind: DraftKind;
    initial?: CourseDraft;
    save: (draft: CourseDraft) => void;
}) {
    const [error, setError] = useState('');

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const file = data.get('file');
        const title = String(data.get('title') ?? '').trim();
        const detail = file instanceof File ? `${file.name} · ${file.size} bytes` : String(data.get('detail') ?? '').trim();
        if (!title || !detail) {
            setError('Enter a title and details before saving.');
            return;
        }

        save({ title, detail });
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <p>Draft for this visit only. Nothing is published, uploaded or sent.</p>
            <label className="block">
                {kind === 'Allocation request' ? 'Requested course' : 'Title'}
                <input
                    className="input"
                    name="title"
                    defaultValue={initial?.title}
                    required
                    pattern=".*\S.*"
                />
            </label>
            {kind === 'Resource' ? (
                <label className="block">
                    Sample file
                    <input type="file" name="file" required />
                </label>
            ) : (
                <label className="block">
                    {kind === 'Chapter' ? 'Chapter text' : 'Details'}
                    <textarea
                        className="input"
                        name="detail"
                        defaultValue={initial?.detail}
                        required
                    />
                </label>
            )}
            {error && <p role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary">Save local draft</button>
        </form>
    );
}
