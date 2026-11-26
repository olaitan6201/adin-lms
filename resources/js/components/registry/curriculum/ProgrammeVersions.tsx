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
            rows={versions.map((p) => [
                p.code,
                p.title,
                status(`L${p.level}`),
                p.units,
                status(p.version, p.version === 'v2 approved' ? 'emerald' : 'amber'),
                p.approved,
                <Action size="sm" onClick={() => mapOutcomes(p)}>
                    Map outcomes
                </Action>,
            ])}
        />
    );
}
