import GradebookDesk from '@/components/assessments/GradebookDesk';
import { gradeDesk } from '@/data/assessments/gradebook';

export default function AdminGradebook() {
    return <GradebookDesk {...gradeDesk} />;
}
