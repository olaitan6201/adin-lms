import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { type Item } from '@/components/assessments/grading/AssessmentItemPanel';
import { SetupBook, type PolicyDefinition } from '@/components/assessments/grading/SetupBook';

export type ApprovedPolicy = Omit<PolicyDefinition, 'items'> & { id: string; version: number };
export function AmendPolicy({
    offering,
    items,
    policy,
}: {
    offering: string;
    items: Item[];
    policy: ApprovedPolicy;
}) {
    return (
        <CourseDisclosure label={`Amend grading policy · version ${policy.version}`}>
            <SetupBook
                key={policy.id}
                url={`/courses/${offering}/assessments`}
                policy={{
                    ...policy,
                    items: items.map((i) => ({
                        id: i.id,
                        title: i.title,
                        kind: i.kind,
                        weight: String(i.weight_percent),
                        maximum: String(i.maximum_score),
                        rubric: i.rubric?.guide ?? '',
                        criteria: i.rubric?.criteria ?? [],
                    })),
                }}
            />
        </CourseDisclosure>
    );
}
