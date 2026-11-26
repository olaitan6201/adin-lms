import { Records, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { ProgrammeVersion } from '@/types/registry/curriculum';

export function ProgrammeVersions({
    versions,
    mapOutcomes,
}: {
    versions: ProgrammeVersion[];
    mapOutcomes: (programme: ProgrammeVersion) => void;
}) {
    return (
        <Records
            tableClass="[&_th:last-child]:w-[150px] [&_td:last-child]:text-right"
            title="Curriculum versions"
            subtitle="Approved versions are retained; changes create a new version rather than overwriting"
            columns={['Code', 'Programme', 'Level', 'Units', 'Version', 'Approved', '']}
            rows={versions.map((p) => {
                const revision = p.revisions[p.revisions.length - 1];
                return [
                    p.code,
                    p.title,
                    status(`L${p.level}`),
                    p.units,
                    status(
                        `v${revision.number} ${revision.state}`,
                        revision.state === 'approved' ? 'emerald' : 'amber',
                    ),
                    revision.approved ?? '—',
                    <Action key="outcomes" size="sm" onClick={() => mapOutcomes(p)}>
                        Map outcomes
                    </Action>,
                ];
            })}
        />
    );
}
