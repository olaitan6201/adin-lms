import { Records, Progress, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { Offering } from '@/types/registry/delivery';

export function OfferingList({
    list,
    filter,
    offeringTotal,
    setTab,
    manage,
    unpublish,
    add,
}: {
    list: Offering[];
    filter: string;
    offeringTotal: number;
    setTab: (tab: number) => void;
    manage: (offering: Offering) => void;
    unpublish: (offering: Offering) => void;
    add: () => void;
}) {
    return (
        <Records
            tableClass="[&_th:last-child]:w-[110px] [&_td:last-child]:text-right"
            title="Course offerings"
            subtitle="Approved structure, assigned instructor, consumed roster and publication state"
            actions={
                <>
                    {status(`${offeringTotal} offerings`, 'emerald')}
                    <Action size="sm" icon="upload" onClick={() => setTab(1)}>
                        Import roster
                    </Action>
                    <Action size="sm" variant="primary" icon="plus" onClick={add}>
                        New offering
                    </Action>
                </>
            }
            columns={['Course', 'Term', 'Mode', 'Instructor', 'Students', 'Completion', 'State', '']}
            rows={list
                .filter((offering) => !filter || offering.state === filter.toLowerCase())
                .map((offering) => [
                    <div className="min-w-0">
                        <p className="truncate font-medium text-ink-800">{offering.title}</p>
                        <p className="truncate font-mono text-[11px] text-ink-400">{offering.code}</p>
                    </div>,
                    <span className="text-[13px] text-ink-600">{offering.term}</span>,
                    status(offering.mode),
                    <span className="text-[13px] text-ink-600">{offering.instructor}</span>,
                    <span className="text-[13px] tnum">{offering.students}</span>,
                    offering.completion ? <Progress n={offering.completion} /> : '-',
                    status(
                        offering.state,
                        offering.state === 'approved' ? 'amber' : offering.state === 'draft' ? 'slate' : undefined,
                    ),
                    <div className="flex justify-end gap-1.5">
                        <Action size="sm" onClick={() => manage(offering)}>
                            Manage
                        </Action>
                        {offering.state === 'published' && (
                            <Action size="sm" onClick={() => unpublish(offering)}>
                                Unpublish
                            </Action>
                        )}
                    </div>,
                ])}
        />
    );
}
