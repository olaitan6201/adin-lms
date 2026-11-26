import { Records, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { Programme } from '@/types/registry/structure';

export function ProgrammeRegister({
    programmes,
    addProgramme,
}: {
    programmes: Programme[];
    addProgramme: () => void;
}) {
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
                <code className="text-xs font-medium text-ink-700">{p.code}</code>,
                <span className="font-medium text-ink-800">{p.title}</span>,
                status(`Level ${p.level}`),
                <span className="text-[13px] text-ink-500">{p.units} units</span>,
                <span className="text-[13px] text-ink-500">{p.department}</span>,
            ])}
        />
    );
}
