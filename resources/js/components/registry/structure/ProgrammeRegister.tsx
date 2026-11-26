import { Records, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { Programme } from '@/types/registry/structure';

type ProgrammeRegisterProps = {
    programmes: Programme[];
    addProgramme: () => void;
};

export function ProgrammeRegister({ programmes, addProgramme }: ProgrammeRegisterProps) {
    return (
        <Records
            title="Programmes"
            subtitle="Programme register across the three faculties"
            actions={
                <Action size="sm" icon="plus" onClick={addProgramme}>
                    Add programme
                </Action>
            }
            columns={['Code', 'Programme', 'Level', 'Units', 'Department']}
            rows={programmes.map((p) => [
                <code key="code" className="text-xs font-medium text-ink-700">
                    {p.code}
                </code>,
                <span key="title" className="font-medium text-ink-800">
                    {p.title}
                </span>,
                status(`Level ${p.level}`),
                <span key="units" className="text-[13px] text-ink-500">
                    {p.units} units
                </span>,
                <span key="department" className="text-[13px] text-ink-500">
                    {p.department}
                </span>,
            ])}
        />
    );
}
