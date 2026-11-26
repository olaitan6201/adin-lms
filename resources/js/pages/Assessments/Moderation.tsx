import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedSelect } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Head, Link } from '@inertiajs/react';
import { Post } from '@/components/assessments/Post';
import { Field } from '@/components/assessments/Fields';
import type { Grade } from '@/components/assessments/grading/ResultRevisions';
import {
    ModerationEvidence,
    type ModerationEvidenceProps,
} from '@/components/assessments/grading/ModerationEvidence';
import { ModerationHistory, type ModerationEvent } from '@/components/assessments/grading/ModerationHistory';

type Props = ModerationEvidenceProps & {
    desk: string;
    learner: string;
    grade: Grade;
    superseded: boolean;
    history: ModerationEvent[];
};

export default function Moderation({
    desk,
    learner,
    grade,
    superseded,
    policy,
    inputs,
    boundaries,
    history,
}: Props) {
    const pending = grade.moderation_status === 'pending';
    const approved = grade.moderation_status === 'approved';
    return (
        <AssessmentWorkspace>
            <Head title="Moderation evidence" />
            <Link className="text-primary underline underline-offset-4" href={desk}>
                Back to assessments
            </Link>
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">
                    Private moderation · Revision {grade.revision}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">Review result for {learner}</h1>
                <p>
                    {grade.total_percent}% · Grade {grade.grade} ·{' '}
                    {grade.published_at ? 'Published' : grade.moderation_status.replaceAll('_', ' ')}
                </p>
            </header>
            <ModerationEvidence inputs={inputs} policy={policy} boundaries={boundaries} />
            {superseded && !grade.published_at && (
                <p>A newer result has replaced this revision. Return to assessments to review it.</p>
            )}
            {!superseded && !grade.published_at && (pending || approved) && (
                <section className="min-w-0 space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight">
                        {pending ? 'Moderation decision' : 'Release result'}
                    </h2>
                    <Post
                        url={`/grades/${grade.id}/review`}
                        button={pending ? 'Record decision' : 'Publish result'}
                    >
                        {pending ? (
                            <Label className="grid min-w-0 gap-2 leading-normal">
                                Decision
                                <ValidatedSelect
                                    name="decision"
                                    aria-label="Decision"
                                    required
                                    defaultValue=""
                                >
                                    <NativeSelectOption value="" disabled>
                                        Choose a decision
                                    </NativeSelectOption>
                                    <NativeSelectOption value="correct">
                                        Request correction
                                    </NativeSelectOption>
                                    <NativeSelectOption value="approve">Approve</NativeSelectOption>
                                </ValidatedSelect>
                            </Label>
                        ) : (
                            <>
                                <input type="hidden" name="decision" value="publish" />
                                <p>
                                    Publishing makes this revision and its component marks available to the
                                    learner.
                                </p>
                            </>
                        )}
                        <Field label="Reason for decision" name="reason" />
                    </Post>
                </section>
            )}
            <ModerationHistory history={history} />
        </AssessmentWorkspace>
    );
}
