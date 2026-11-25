import { NativeSelect } from '@/components/ui/native-select';
import { Input } from '@/components/ui/input';
import { EntryForm } from './EntryForm';
import type { Participant } from './contracts';

export function AttendanceForm({
    action,
    statuses,
    participants,
}: {
    action: string;
    statuses: string[];
    participants: Participant[];
}) {
    return (
        <details>
            <summary>Record attendance</summary>
            <EntryForm action={action} label="Save attendance">
                <label>
                    Participant
                    <NativeSelect required name="user_id" defaultValue="">
                        <option value="">Select participant</option>
                        {participants.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.full_name}
                            </option>
                        ))}
                    </NativeSelect>
                </label>
                <label>
                    Attendance
                    <NativeSelect name="status">
                        {statuses.map((m) => (
                            <option key={m}>{m}</option>
                        ))}
                    </NativeSelect>
                </label>
                <label>
                    Reason for correction
                    <Input name="reason" />
                </label>
            </EntryForm>
        </details>
    );
}
