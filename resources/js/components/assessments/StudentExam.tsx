import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { QuestionPalette, QuestionView } from './ExamQuestions';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Details, Drawer } from './Controls';
import { Note } from '@/components/ui/feedback/Note';
import type { Sitting } from '@/types/assessments/examPaper';
import { useExamAttempt } from '@/hooks/assessments/useExamAttempt';

export default function StudentExam(sitting: Sitting) {
    if (!sitting.paper.length) {
        return <Card title={sitting.title}>No questions are available for this sitting.</Card>;
    }

    return <ExamRunner {...sitting} />;
}

function ExamRunner(sitting: Sitting) {
    const { paper, title, eyebrow, facts } = sitting;
    const { attempt, remaining, stored, jump, flag, answer, submit } = useExamAttempt(sitting);
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
                                href={stored ? workspaceUrl('student/overview') : undefined}
                                disabled={!stored}
                            >
                                Save and exit
                            </Action>
                            <Action icon="check" size="sm" variant="primary" onClick={() => setConfirm(true)}>
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
                        Answers are saved continuously. Leaving the page does not clear your work, but the paper still closes when the
                        access window expires.
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

function AccessWindow({ remaining, stored, facts }: { remaining: number; stored: boolean; facts: Sitting['facts'] }) {
    return (
        <Card className="exam-facts" title="Access window">
            <div className="rounded-xl bg-ink-900 p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Time remaining</p>
                <p role="timer" className="tnum mt-1 font-mono text-3xl font-medium tracking-tight">
                    {`${Math.floor(remaining / 60)}`.padStart(2, '0')}:{`${remaining % 60}`.padStart(2, '0')}
                </p>
                <p className="mt-2 text-[11.5px] text-ink-400">Auto-submits at 00:00</p>
            </div>
            <p
                role="status"
                className="my-4 flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-3 text-[12.5px] text-ink-600"
            >
                <span className="flex items-center gap-2">
                    <Icon name="save" className="size-4 text-brand-600" />
                    {stored ? 'All responses saved' : 'Local storage unavailable; keep this page open'}
                </span>
                {stored && <small className="text-[11px] text-ink-400">just now</small>}
            </p>
            <Details
                items={facts.map(([label, value]) => [label, /^\d+$/.test(value) ? <span className="tnum">{value}</span> : value])}
            />
        </Card>
    );
}

function ExamReceipt({
    title,
    submitted,
    deadline,
    answered,
    count,
    stored,
}: {
    title: string;
    submitted: number;
    deadline: number;
    answered: number;
    count: number;
    stored: boolean;
}) {
    return (
        <Card title="Examination submitted" subtitle="Local attempt receipt">
            <Details
                items={[
                    ['Paper', title],
                    ['Submitted', new Date(submitted).toLocaleString()],
                    ['Reason', submitted === deadline ? 'Access window expired' : 'Submitted by candidate'],
                    ['Answered', `${answered} of ${count}`],
                    ['Record', stored ? 'Saved in this browser session' : 'In memory only; storage unavailable'],
                ]}
            />
            <Action href={workspaceUrl('student/overview')}>Return to dashboard</Action>
        </Card>
    );
}
