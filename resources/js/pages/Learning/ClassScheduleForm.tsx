import { EntryForm, localInput } from './EntryForm';
import type { Choice, Session } from './contracts';

export function ClassScheduleForm({
    action,
    session,
    statuses,
    materials,
}: {
    action: string;
    statuses: string[];
    session?: Session;
    materials: Choice[];
}) {
    return (
        <details>
            <summary>{session ? 'Edit session' : 'Schedule a class'}</summary>
            <EntryForm action={action} label="Save session">
                <label>
                    Class title
                    <input name="title" required defaultValue={session?.title} />
                </label>
                <label>
                    Starts (local time)
                    <input
                        type="datetime-local"
                        name="starts_at"
                        required
                        defaultValue={localInput(session?.starts_at)}
                    />
                </label>
                <label>
                    Ends (local time)
                    <input type="datetime-local" name="ends_at" required defaultValue={localInput(session?.ends_at)} />
                </label>
                <label>
                    Meeting link (HTTPS)
                    <input type="url" name="meeting_url" defaultValue={session?.meeting_url || ''} />
                </label>
                <label>
                    Recording or alternative
                    <select name="recording_material_id" defaultValue={session?.recording_material_id || ''}>
                        <option value="">None</option>
                        {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.title}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Status
                    <select name="status" defaultValue={session?.status}>
                        {statuses.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </label>
            </EntryForm>
        </details>
    );
}
