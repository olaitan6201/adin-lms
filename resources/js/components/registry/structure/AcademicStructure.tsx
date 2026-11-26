import { useDesk, Register, Note, Field } from '@/components/registry/Desk';
import { Details, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { FacultyHierarchy } from '@/components/registry/FacultyHierarchy';
import { useAcademicUnits } from './useAcademicUnits';
import { AcademicSessions } from './AcademicSessions';
import { StructureHealth } from './StructureHealth';
import { ProgrammeRegister } from './ProgrammeRegister';
import type { Faculty, AcademicStructureInputs } from '@/types/registry/structure';

export function AcademicStructure({
    initialFaculties,
    initialProgrammes,
    academicSessions,
    windows,
    healthScope,
    structureChecks,
}: AcademicStructureInputs) {
    const desk = useDesk();
    const { faculties, programmes, addUnit, addProgramme } = useAcademicUnits({
        initialFaculties,
        initialProgrammes,
        desk,
    });

    function importStructure() {
        desk.show({
            title: 'Import structure',
            body: <Field label="Structure file" type="file" required />,
            submit: 'Import',
            message: 'Structure file selected for review',
        });
    }

    function showOversight(faculty: Faculty) {
        desk.show({
            title: 'Oversight scope',
            subtitle: faculty.name,
            body: (
                <Details
                    entries={[
                        ['Dean', faculty.head],
                        ['Departments', faculty.departments.map((d) => d.name).join(', ')],
                    ]}
                />
            ),
        });
    }

    return (
        <Register
            title="Academic structure"
            eyebrow="Academic organisation"
            description="The hierarchy that scopes every other module: oversight, rosters, curricula and reporting all resolve through it."
            overlay={desk.overlay}
            actions={
                <>
                    <Action icon="upload" onClick={importStructure}>
                        Import structure
                    </Action>
                    <Action icon="plus" variant="primary" onClick={addUnit}>
                        Add faculty or department
                    </Action>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="min-w-0 xl:col-span-8">
                    <Card
                        title="Institution hierarchy"
                        subtitle="Faculty, department and programme assignment"
                        actions={
                            <>
                                {status(`${faculties.length} faculties`, 'emerald')}
                                {status(`${faculties.flatMap((f) => f.departments).length} departments`)}
                                {status(`${programmes.length} programmes`)}
                            </>
                        }
                    >
                        <FacultyHierarchy
                            faculties={faculties}
                            programmes={programmes}
                            onOversight={showOversight}
                        />
                    </Card>
                </div>
                <div className="xl:col-span-4">
                    <StructureHealth {...{ structureChecks, healthScope }} />
                </div>
            </div>
            <ProgrammeRegister {...{ programmes, addProgramme }} />
            <AcademicSessions {...{ academicSessions, windows, desk }} />
            <Note>
                Oversight scopes are inherited: a dean sees every department in the faculty, a head of department
                sees only their own department. Scope changes take effect on the next login.
            </Note>
        </Register>
    );
}
