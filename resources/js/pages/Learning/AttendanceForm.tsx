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
                    <select required name="user_id" defaultValue="">
                        <option value="">Select participant</option>
                        {participants.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.full_name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Attendance
                    <select name="status">
                        {statuses.map((m) => (
                            <option key={m}>{m}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Reason for correction
                    <input name="reason" />
                </label>
            </EntryForm>
        </details>
    );
}
