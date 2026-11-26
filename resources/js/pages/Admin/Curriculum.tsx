import {
    catalogueEntries,
    programmeVersions,
    prerequisite,
    selectedCourse,
    accountingOutcomes,
} from '@/data/registry/catalogue';
import { CurriculumCatalogue } from '@/components/registry/curriculum/CurriculumCatalogue';

export default function Curriculum() {
    return (
        <CurriculumCatalogue
            {...{
                catalogueEntries,
                programmeVersions,
                prerequisite,
                selectedCourse,
                accountingOutcomes,
            }}
        />
    );
}
