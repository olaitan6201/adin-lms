import { useState, type FormEvent } from 'react';
import type { Recording } from '@/types/learning/study';

export type Attachment = {
    moduleId: string;
    name: string;
};

export function RecordingAttachment({ recording, initial, save, cancel }: {
    recording: Recording;
    initial?: Attachment;
    save: (attachment: Attachment) => void;
    cancel: () => void;
}) {
    const [error, setError] = useState('');

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        const moduleId = String(values.get('module') ?? '');
        const name = String(values.get('name') ?? '').trim();
        if (!recording.modules.some((module) => module.id === moduleId)) {
            setError(`Choose a module from ${recording.course}.`);
            return;
        }

        if (!name || name.length > 120) {
            setError('Enter a resource name of 1 to 120 characters.');
            return;
        }

        save({ moduleId, name });
    }

    return (
        <form className="space-y-4" onSubmit={submit}>
            <label className="block">
                Module in {recording.course}
                <select
                    className="select"
                    name="module"
                    defaultValue={initial?.moduleId ?? ''}
                    required
                >
                    <option value="">Choose a module</option>
                    {recording.modules.map((module) => (
                        <option key={module.id} value={module.id}>{module.title}</option>
                    ))}
                </select>
            </label>
            <label className="block">
                Resource name
                <input
                    className="input"
                    name="name"
                    defaultValue={initial?.name ?? recording.title}
                    maxLength={120}
                    required
                />
            </label>
            <p>This creates a local resource reference for this visit. No recording is uploaded or published.</p>
            {error && <p role="alert">{error}</p>}
            <div className="flex gap-2">
                <button type="button" className="btn btn-outline" onClick={cancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Attach locally</button>
            </div>
        </form>
    );
}
