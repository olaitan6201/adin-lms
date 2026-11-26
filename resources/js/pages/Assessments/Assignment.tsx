import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { Head } from '@inertiajs/react';
import { SubmissionEntry } from '@/components/assessments/assignments/SubmissionEntry';
import { type Rubric } from '@/components/assessments/assignments/SubmissionMarkForm';
import {
    type AssignmentDetail,
    type SubmissionRow,
} from '@/components/assessments/assignments/assignmentDetail';
import { AssignmentBrief } from '@/components/assessments/assignments/AssignmentBrief';
import { SubmissionHistory } from '@/components/assessments/assignments/SubmissionHistory';

type Props = {
    pending: string[];
    assignment: AssignmentDetail;
    title: string;
    rubric: Rubric | null;
    marker: boolean;
    rows: SubmissionRow[];
    groups: {
        id: string;
        name: string;
    }[];
    references: string[];
};

export default function Assignment({
    assignment: a,
    title,
    rubric,
    marker,
    rows,
    groups,
    references,
    pending,
}: Props) {
    const individualSubmissionComplete = !a.group_work && !a.editable && rows.length > 0;
    const url = `/assignments/${a.id}`;
    return (
        <AssessmentWorkspace>
            <Head title={title} />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">
                    {marker
                        ? 'Marking workspace'
                        : a.group_work
                          ? 'Group assignment'
                          : 'Individual assignment'}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <nav aria-label="Assignment sections" className="flex flex-wrap gap-x-5 gap-y-2">
                    <a className="text-primary underline underline-offset-4" href="#submissions">
                        Submission history
                    </a>
                </nav>
            </header>
            <div className="grid items-start gap-5 xl:grid-cols-2">
                <AssignmentBrief assignment={a} url={url} references={references} rubric={rubric} />
                <div className="assessment-panel">
                    {!marker && individualSubmissionComplete && (
                        <section
                            aria-label="Submission received"
                            className="space-y-2 rounded-md bg-muted p-4"
                        >
                            <h2 className="text-xl font-semibold tracking-tight">Your submission</h2>
                            <p role="status">
                                Revision received.{' '}
                                <a className="text-primary underline underline-offset-4" href="#submissions">
                                    View submission history
                                </a>
                            </p>
                            <p>This assignment accepts one submission.</p>
                        </section>
                    )}
                    {!marker && !individualSubmissionComplete && (
                        <SubmissionEntry
                            url={url}
                            formats={a.accepted_formats}
                            groupWork={a.group_work}
                            groups={groups}
                        />
                    )}
                    {marker && (
                        <section className="min-w-0 space-y-3">
                            <h2 className="text-xl font-semibold tracking-tight">Pending submissions</h2>
                            <p>{pending.length ? pending.join(', ') : 'All learners have submitted.'}</p>
                        </section>
                    )}
                </div>
            </div>
            <SubmissionHistory rows={rows} url={url} marker={marker} rubric={rubric} />
        </AssessmentWorkspace>
    );
}
