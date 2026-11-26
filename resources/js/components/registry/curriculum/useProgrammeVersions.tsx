import { useState } from 'react';
import { type Desk, Note, Field } from '@/components/registry/Desk';
import { val } from '@/components/registry/Records';
import { Card } from '@/components/ui/layout/Card';
import type { ProgrammeVersion } from '@/types/registry/curriculum';

export function useProgrammeVersions({
    programmeVersions,
    programmes,
    programmeOutcomes,
    desk,
    setTab,
}: {
    programmeVersions: ProgrammeVersion[];
    programmes: { title: string }[];
    programmeOutcomes: string[];
    desk: Desk;
    setTab: (tab: number) => void;
}) {
    const [versions, setVersions] = useState(programmeVersions);

    function newVersion() {
        desk.show({
            title: 'New curriculum version',
            body: <Field label="Programme" options={programmes.map((programme) => programme.title)} />,
            submit: 'Create draft',
            save: (data) => {
                setVersions((records) =>
                    records.map((record) =>
                        record.title === val(data, 'Programme') ? { ...record, version: 'v3 draft' } : record,
                    ),
                );
                setTab(1);
            },
        });
    }

    function mapOutcomes(programme: ProgrammeVersion) {
        desk.show({
            title: `Outcome mapping for ${programme.title}`,
            subtitle: `Version ${programme.revision} · approved ${programme.approved}`,
            submit: 'Submit mapping',
            message: 'Mapping submitted for approval',
            body: (
                <>
                    <Card title="Programme outcomes">
                        <ol className="space-y-2 text-sm">
                            {programmeOutcomes.map((o, i) => (
                                <li key={o}>
                                    <code>PO{i + 1}</code>　{o}
                                </li>
                            ))}
                        </ol>
                    </Card>
                    <Note>
                        Each mapping change is versioned. QA reports the approved structure for the current
                        session.
                    </Note>
                </>
            ),
            save: () =>
                setVersions((records) =>
                    records.map((record) =>
                        record.id === programme.id ? { ...record, version: 'Awaiting approval' } : record,
                    ),
                ),
        });
    }
    return { versions, newVersion, mapOutcomes };
}
