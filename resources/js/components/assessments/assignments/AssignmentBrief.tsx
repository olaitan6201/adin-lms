import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { AssignmentLimits } from '@/components/assessments/assignments/AssignmentLimits';
import { type Rubric } from '@/components/assessments/assignments/SubmissionMarkForm';
import { type AssignmentDetail } from './assignmentDetail';
import { AssignmentDownload } from './AssignmentDownload';

export function AssignmentBrief({
    assignment: a,
    url,
    references,
    rubric,
}: {
    assignment: AssignmentDetail;
    url: string;
    references: string[];
    rubric: Rubric | null;
}) {
    return (
        <section aria-label="Assignment brief" className="assessment-panel space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Assignment brief</h2>
            <p className="max-w-prose whitespace-pre-wrap">{a.instructions}</p>
            <a className="text-primary underline underline-offset-4" href={`${url}/instructions`}>
                Download instructions (.txt)
            </a>
            <AssignmentLimits assignment={a} />
            {references.map((id) => (
                <AssignmentDownload key={id} url={url} id={id}>
                    Download reference
                </AssignmentDownload>
            ))}
            {rubric && (rubric.guide || rubric.criteria?.length) ? (
                <CourseDisclosure label="Marking criteria">
                    <p>{rubric.guide}</p>
                    {rubric.criteria?.map((c) => (
                        <div key={c.id}>
                            <h3 className="font-semibold">{c.title}</h3>
                            <p>{c.description}</p>
                            <ul>
                                {c.levels.map((l) => (
                                    <li key={l.id}>
                                        {l.label}: {l.points} points. {l.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </CourseDisclosure>
            ) : null}
            <p>
                {a.editable ? 'Revisions accepted.' : 'One submission only.'}{' '}
                {a.late_policy.allow ? 'Late work accepted until close.' : 'No late submissions.'}
            </p>
        </section>
    );
}
