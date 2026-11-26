import StudentExam from '@/components/assessments/StudentExam';
import { studentSitting } from '@/data/assessments/examPaper';

export default function StudentExamPage() {
    return <StudentExam {...studentSitting} />;
}
