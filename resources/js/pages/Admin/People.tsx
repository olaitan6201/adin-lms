import {
    staffDirectory,
    studentDirectory,
    devices,
    learningHistory,
    studentMetrics,
    directorySummary,
} from '@/data/registry/directory';
import { roleMatrix, permissionMatrix } from '@/data/registry/institution';
import { PeopleDirectory } from '@/components/registry/people/PeopleDirectory';

export default function People() {
    return (
        <PeopleDirectory
            {...{
                staffDirectory,
                studentDirectory,
                devices,
                learningHistory,
                studentMetrics,
                directorySummary,
                roleMatrix,
                permissionMatrix,
            }}
        />
    );
}
