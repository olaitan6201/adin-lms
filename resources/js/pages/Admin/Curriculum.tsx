import {
    programmeOutcomes,
    matrix,
    columns,
    catalogueEntries,
    programmeVersions,
    prerequisite,
    selectedCourse,
    accountingOutcomes,
} from '@/data/registry/catalogue';
import { programmes } from '@/data/registry/institution';
import { CurriculumCatalogue } from '@/components/registry/curriculum/CurriculumCatalogue';

export default function Curriculum() {
    return (
        <CurriculumCatalogue
            {...{
                programmeOutcomes,
                matrix,
                columns,
                catalogueEntries,
                programmeVersions,
                prerequisite,
                selectedCourse,
                accountingOutcomes,
                programmes,
            }}
        />
    );
}
