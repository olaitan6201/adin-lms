import { academicSessions, windows, healthScope, structureChecks } from '@/data/registry/academicStructure';
import { faculties as initialFaculties, programmes as initialProgrammes } from '@/data/registry/institution';
import { AcademicStructure } from '@/components/registry/structure/AcademicStructure';

export default function Structure() {
    return (
        <AcademicStructure
            {...{ initialFaculties, initialProgrammes, academicSessions, windows, healthScope, structureChecks }}
        />
    );
}
