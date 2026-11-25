import { CourseDisclosure } from '@/components/CourseDisclosure';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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
        <CourseDisclosure label="Record attendance">
            <EntryForm action={action} label="Save attendance">
                <Label className="grid gap-2">
                    Participant
                    <NativeSelect required name="user_id" defaultValue="">
                        <NativeSelectOption value="">Select participant</NativeSelectOption>
                        {participants.map((p) => (
                            <NativeSelectOption key={p.id} value={p.id}>
                                {p.full_name}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
                <Label className="grid gap-2">
                    Attendance
                    <NativeSelect name="status">
                        {statuses.map((m) => (
                            <NativeSelectOption key={m}>{m}</NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
                <Label className="grid gap-2">
                    Reason for correction
                    <Input name="reason" />
                </Label>
            </EntryForm>
        </CourseDisclosure>
    );
}
