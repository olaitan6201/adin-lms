import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { QuestionPalette } from './exams/QuestionPalette';
import { QuestionView } from './exams/QuestionView';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Drawer } from './Drawer';
import { Details } from './RecordDetails';
import { Note } from '@/components/ui/feedback/Note';
import type { Sitting } from '@/types/assessments/examPaper';
import { useExamAttempt } from '@/hooks/assessments/useExamAttempt';
import { AccessWindow } from './exams/AccessWindow';
import { ExamReceipt } from './exams/ExamReceipt';

export default function StudentExam(sitting: Sitting) {
    if (!sitting.paper.length) {
        return <Card title={sitting.title}>No questions are available for this sitting.</Card>;
    }

    return <ExamRunner {...sitting} />;
}

function ExamRunner(sitting: Sitting) {
    const { paper, title, eyebrow, facts } = sitting;
    const { attempt, remaining, stored, jump, flag, answer, submit, showWarning } = useExamAttempt(sitting);
    const [confirm, setConfirm] = useState(false);
    const q = paper[attempt.index];
    const flagged = attempt.flags.includes(q.id);
    const answered = Object.values(attempt.answers).filter((v) => v.trim()).length;
    const complete = attempt.submitted !== null;
    const submitButton = (
        <Action icon="check" variant="primary" onClick={() => setConfirm(true)}>
            Submit examination
        </Action>
    );
    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow={eyebrow}
                title={title}
                description="Your responses are saved as you work. The paper closes automatically when the access window expires."
                actions={
                    !complete && (
                        <>
                            <Action
                                icon="save"
                                size="sm"
                                href={workspaceUrl('student/overview')}
                                disabled={!stored}
                            >
                                Save and exit
                            </Action>
                            <Action
                                icon="check"
                                size="sm"
                                variant="primary"
                                onClick={() => setConfirm(true)}
                            >
                                Submit examination
                            </Action>
                        </>
                    )
                }
            />
            {attempt.submitted !== null ? (
                <ExamReceipt
                    title={title}
                    submitted={attempt.submitted}
                    deadline={attempt.deadline}
                    answered={answered}
                    count={paper.length}
                    stored={stored}
                />
            ) : (
                <>
                    <div role="alert">
                        {showWarning && <Note amber>Five minutes or less remain. Review your answers before the paper closes.</Note>}
                    </div>
                    <div className="grid gap-5 xl:grid-cols-12">
                        <div className="space-y-5 xl:col-span-4">
                            <AccessWindow remaining={remaining} stored={stored} facts={facts} />
                            <QuestionPalette
                                paper={paper}
                                index={attempt.index}
                                answers={attempt.answers}
                                flags={attempt.flags}
                                jump={jump}
                            />
                        </div>
                        <div className="min-w-0 space-y-5 xl:col-span-8">
                            <QuestionView
                                question={q}
                                index={attempt.index}
                                count={paper.length}
                                value={attempt.answers[q.id] ?? ''}
                                stored={stored}
                                flagged={flagged}
                                answered={answered}
                                answer={answer}
                                flag={flag}
                                jump={jump}
                                submitButton={submitButton}
                            />
                        </div>
                    </div>
                    <Note amber>
                        {stored
                            ? 'Answers are saved continuously. Leaving the page does not clear your work, but the paper still closes when the access window expires.'
                            : 'Responses are only in memory. Keep this page open to avoid losing your work.'}
                    </Note>
                </>
            )}
            {confirm && !complete && (
                <Drawer title="Submit examination?" close={() => setConfirm(false)}>
                    <Details
                        items={[
                            ['Answered', `${answered} of ${paper.length}`],
                            ['Unanswered', paper.length - answered],
                            ['Flagged for review', attempt.flags.length],
                        ]}
                    />
                    <p>After submission you cannot change your answers.</p>
                    <Action onClick={() => setConfirm(false)}>Continue examination</Action>{' '}
                    <Action variant="primary" onClick={submit}>
                        Confirm submission
                    </Action>
                </Drawer>
            )}
        </div>
    );
}
