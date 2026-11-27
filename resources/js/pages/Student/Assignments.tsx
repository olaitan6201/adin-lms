import { initialSelection } from '@/lib/assignmentSelection';
import StudentAssignments from '@/components/assessments/StudentAssignments';
import { assignmentPreview, studentAssignments } from '@/data/assessments/studentAssignments';

export default function StudentAssignmentsPage() {
    return (
        <StudentAssignments
            {...studentAssignments}
            initialAssignmentId={initialSelection('assignment')}
            preview={assignmentPreview}
        />
    );
}
