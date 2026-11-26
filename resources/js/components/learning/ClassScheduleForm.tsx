import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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
        <CourseDisclosure label={session ? 'Edit session' : 'Schedule a class'}>
            <EntryForm action={action} label="Save session" originalTimes={session}>
                <Label className="grid gap-2">
                    Class title
                    <Input name="title" required defaultValue={session?.title} />
                </Label>
                <Label className="grid gap-2">
                    Starts (local time)
                    <Input
                        type="datetime-local"
                        name="starts_at"
                        required
                        defaultValue={localInput(session?.starts_at)}
                    />
                </Label>
                <Label className="grid gap-2">
                    Ends (local time)
                    <Input
                        type="datetime-local"
                        name="ends_at"
                        required
                        defaultValue={localInput(session?.ends_at)}
                    />
                </Label>
                <Label className="grid gap-2">
                    Meeting link (HTTPS)
                    <Input type="url" name="meeting_url" defaultValue={session?.meeting_url || ''} />
                </Label>
                <Label className="grid gap-2">
                    Recording or alternative
                    <NativeSelect name="recording_material_id" defaultValue={session?.recording_material_id || ''}>
                        <NativeSelectOption value="">None</NativeSelectOption>
                        {materials.map((m) => (
                            <NativeSelectOption key={m.id} value={m.id}>
                                {m.title}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
                <Label className="grid gap-2">
                    Status
                    <NativeSelect name="status" defaultValue={session?.status}>
                        {statuses.map((s) => (
                            <NativeSelectOption key={s}>{s}</NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
            </EntryForm>
        </CourseDisclosure>
    );
}
