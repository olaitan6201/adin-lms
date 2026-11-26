import { useState } from 'react';
import { useDesk, Register, exportRecords } from '@/components/registry/Desk';
import { status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { OutcomeMatrix } from '@/components/registry/OutcomeMatrix';
import { useCourseDefinitions } from './useCourseDefinitions';
import { useProgrammeVersions } from './useProgrammeVersions';
import { DefinitionRegister } from './DefinitionRegister';
import { ProgrammeVersions } from './ProgrammeVersions';
import type { CurriculumCatalogueInputs } from '@/types/registry/curriculum';

export function CurriculumCatalogue({
    programmeOutcomes,
    matrix,
    columns,
    catalogueEntries,
    programmeVersions,
    prerequisite,
    selectedCourse,
    accountingOutcomes,
    programmes,
}: CurriculumCatalogueInputs) {
    const [tab, setTab] = useState(0);
    const desk = useDesk();
    const { courses, courseForm } = useCourseDefinitions({
        catalogueEntries,
        prerequisite,
        selectedCourse,
        accountingOutcomes,
        desk,
    });
    const { versions, newVersion, mapOutcomes } = useProgrammeVersions({
        programmeVersions,
        programmes,
        programmeOutcomes,
        desk,
        setTab,
    });

    return (
        <Register
            title="Curriculum catalogue"
            eyebrow="Curriculum and catalogue"
            description="Course definitions, programme versions and the outcome mapping that QA reports against."
            actions={
                <>
                    <Action icon="download" onClick={() => exportRecords('curriculum', courses)}>
                        Export curriculum
                    </Action>
                    <Action icon="plus" variant="primary" onClick={newVersion}>
                        New curriculum version
                    </Action>
                </>
            }
            overlay={desk.overlay}
            active={tab}
            select={setTab}
            tabs={[
                ['Course catalogue', courses.length],
                ['Programme versions', versions.length],
                ['Outcome mapping'],
            ]}
        >
            {tab === 0 && <DefinitionRegister {...{ courses, courseForm }} />}
            {tab === 1 && <ProgrammeVersions {...{ versions, mapOutcomes }} />}
            {tab === 2 && (
                <Card
                    title="Course outcome to programme outcome mapping"
                    subtitle="Weight: 0 none, 1 introduced, 2 reinforced, 3 mastered"
                    actions={
                        <>
                            {status('NUC CCMAS format', 'emerald')}
                            <Action
                                size="sm"
                                icon="download"
                                onClick={() => exportRecords('outcome-matrix', matrix)}
                            >
                                Export matrix
                            </Action>
                        </>
                    }
                >
                    <OutcomeMatrix {...{ matrix, columns }} />
                </Card>
            )}
        </Register>
    );
}
