import { initialSelection } from '@/lib/assignmentSelection';
import AssignmentsDesk from '@/components/assessments/AssignmentsDesk';
import { assignmentDesk } from '@/data/assessments/assignments';

export default function LecturerAssignments() {
    return <AssignmentsDesk {...assignmentDesk} lecturer initialSubmissionId={initialSelection('submission')} />;
}
