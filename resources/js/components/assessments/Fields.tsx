import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedInput, ValidatedSelect } from './ValidatedFields';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function Field({
    label,
    name,
    type = 'text',
    value,
    optional = false,
}: {
    label: string;
    name: string;
    type?: string;
    value?: string;
    optional?: boolean;
}) {
    return (
        <Label className="grid min-w-0 gap-2 leading-normal">
            {label}
            <ValidatedInput
                name={name}
                type={type}
                defaultValue={value}
                required={!optional}
                step={type === 'number' ? 'any' : undefined}
            />
        </Label>
    );
}

interface CheckProps {
    name: string;
    label: string;
}

export function Check({ name, label }: CheckProps) {
    return (
        <Label className="flex items-center gap-3 leading-normal">
            <Checkbox name={name} value="1" />
            {label}
        </Label>
    );
}

export type Member = {
    id: string;
    name: string;
};
export function Roster({ members }: { members: Member[] }) {
    return (
        <Label className="grid min-w-0 gap-2 leading-normal">
            Learner
            <ValidatedSelect name="enrolment" required>
                {members.map((m) => (
                    <NativeSelectOption key={m.id} value={m.id}>
                        {m.name}
                    </NativeSelectOption>
                ))}
            </ValidatedSelect>
        </Label>
    );
}
