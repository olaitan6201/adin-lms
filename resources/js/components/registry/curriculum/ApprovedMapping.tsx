import { useState } from 'react';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { OutcomeMatrix } from '@/components/registry/OutcomeMatrix';
import { status } from '@/components/registry/Records';
import { exportRecords } from '@/components/registry/Desk';
import type { ProgrammeVersion } from '@/types/registry/curriculum';

export function ApprovedMapping({ programmes }: { programmes: ProgrammeVersion[] }) {
    const [id, select] = useState(
        () => programmes.find((p) => p.revisions.some((r) => r.mapping))?.id ?? programmes[0]?.id,
    );
    const programme = programmes.find((p) => p.id === id);
    const approved = programme?.revisions.filter((r) => r.state === 'approved').at(-1);
    const mapping = approved?.mapping;
    return (
        <Card
            title="Course outcome to programme outcome mapping"
            subtitle={`Approved revision ${approved?.number ?? '—'} · Weight: 0 none, 1 introduced, 2 reinforced, 3 mastered`}
            actions={
                <>
                    {status('NUC CCMAS format', 'emerald')}
                    <Action
                        size="sm"
                        icon="download"
                        disabled={!mapping}
                        onClick={() => mapping && exportRecords('outcome-matrix', mapping.matrix)}
                    >
                        Export matrix
                    </Action>
                </>
            }
        >
            <label className="mb-4 block">
                <span className="label">Programme</span>
                <select className="select" value={id ?? ''} onChange={(event) => select(event.target.value)}>
                    {programmes.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.title}
                        </option>
                    ))}
                </select>
            </label>
            {mapping ? <OutcomeMatrix {...mapping} /> : <p>No approved mapping recorded for this programme.</p>}
        </Card>
    );
}
