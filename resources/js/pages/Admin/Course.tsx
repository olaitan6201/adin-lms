import { selectedCourse } from '@/data/registry/catalogue';
import { courseModules } from '@/data/registry/academics';
import { gradeWeights } from '@/data/registry/assessment';
import { CourseRecord } from '@/components/registry/course/CourseRecord';

export default function Course() {
    return <CourseRecord {...{ selectedCourse, courseModules, gradeWeights }} />;
}
