import { Records, Metrics, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { RosterStudent } from '@/types/registry/delivery';

export function RosterIngestion({
    offerings,
    rosterMetrics,
    roster,
    remove,
}: {
    offerings: { code: string; students: number; state: string }[];
    rosterMetrics: [string, string, string?][];
    roster: RosterStudent[];
    remove: (id: string) => void;
}) {
    const offering = offerings[0];

    return (
        <Records
            tableClass="[&_th:last-child]:w-[100px] [&_td:last-child]:text-right"
            title="Roster ingestion"
            subtitle={
                offering
                    ? `${offering.code} · ${offering.students} enrolled from the institutional enrolment feed`
                    : undefined
            }
            actions={status('Feed: nightly CSV', 'sky')}
            columns={['Matric number', 'Student', 'Programme', 'Status', '']}
            rows={roster.map((s) => [
                s.matric,
                s.name,
                s.programme,
                status(
                    s.status === 'active' ? 'Enrolled' : 'Pending',
                    s.status === 'active' ? 'emerald' : 'amber',
                ),
                <Action size="sm" onClick={() => remove(s.id)}>
                    Remove
                </Action>,
            ])}
        >
            <Metrics rows={rosterMetrics} />
        </Records>
    );
}
