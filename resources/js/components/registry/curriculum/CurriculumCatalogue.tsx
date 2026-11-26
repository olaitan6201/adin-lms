import { ApprovedMapping } from './ApprovedMapping';
import { download } from '@/lib/download';
import { useState } from 'react';
import { useDesk, Register } from '@/components/registry/Desk';
import { Action } from '@/components/ui/controls/Action';
import { useCourseDefinitions } from './useCourseDefinitions';
import { useProgrammeVersions } from './useProgrammeVersions';
import { DefinitionRegister } from './DefinitionRegister';
import { ProgrammeVersions } from './ProgrammeVersions';
import type { CurriculumCatalogueInputs } from '@/types/registry/curriculum';

export function CurriculumCatalogue({
    catalogueEntries,
    programmeVersions,
    prerequisite,
    selectedCourse,
    accountingOutcomes,
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

        desk,
        setTab,
    });

    function exportCurriculum() {
        download(
            'curriculum.json',
            JSON.stringify({ courses, programmes: versions }, null, 2),
            'application/json',
        );
    }
    return (
        <Register
            title="Curriculum catalogue"
            eyebrow="Curriculum and catalogue"
            description="Course definitions, programme versions and the outcome mapping that QA reports against."
            actions={
                <>
                    <Action icon="download" onClick={exportCurriculum}>
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
            {tab === 2 && <ApprovedMapping programmes={versions} />}
        </Register>
    );
}
