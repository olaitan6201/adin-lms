import StudentAssignments from '@/components/assessments/StudentAssignments';
import { studentAssignments } from '@/data/assessments/studentAssignments';

export default function StudentAssignmentsPage() {
    return <StudentAssignments {...studentAssignments} />;
}
