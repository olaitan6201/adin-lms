import AssignmentsDesk from '@/components/assessments/AssignmentsDesk';
import { assignmentDesk } from '@/data/assessments/assignments';

export default function AdminAssignments() {
    return <AssignmentsDesk {...assignmentDesk} />;
}
