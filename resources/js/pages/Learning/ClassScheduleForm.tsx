import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
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
            <EntryForm action={action} label="Save session" originalTimes={session}>
                <label>
                    Class title
                    <Input name="title" required defaultValue={session?.title} />
                </label>
                <label>
                    Starts (local time)
                    <Input
                        type="datetime-local"
                        name="starts_at"
                        required
                        defaultValue={localInput(session?.starts_at)}
                    />
                </label>
                <label>
                    Ends (local time)
                    <Input type="datetime-local" name="ends_at" required defaultValue={localInput(session?.ends_at)} />
                </label>
                <label>
                    Meeting link (HTTPS)
                    <Input type="url" name="meeting_url" defaultValue={session?.meeting_url || ''} />
                </label>
                <label>
                    Recording or alternative
                    <NativeSelect name="recording_material_id" defaultValue={session?.recording_material_id || ''}>
                        <option value="">None</option>
                        {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.title}
                            </option>
                        ))}
                    </NativeSelect>
                </label>
                <label>
                    Status
                    <NativeSelect name="status" defaultValue={session?.status}>
                        {statuses.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </NativeSelect>
                </label>
            </EntryForm>
        </details>
    );
}
