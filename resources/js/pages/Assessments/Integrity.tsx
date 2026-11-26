import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Head } from '@inertiajs/react';
import { Post } from '@/components/assessments/Post';
import type { IntegrityPolicy } from '@/components/assessments/exams/IntegrityNotice';
import {
    VisibilityObservations,
    type VisibilitySignals,
} from '@/components/assessments/exams/VisibilityObservations';

type Props = {
    exam: string;
    title: string;
    policy: IntegrityPolicy;
    locked: boolean;
    signals: VisibilitySignals;
};

export default function Integrity({ exam, title, policy, locked, signals }: Props) {
    const url = `/examinations/${exam}/integrity`;
    return (
        <AssessmentWorkspace>
            <Head title={`Exam conditions · ${title}`} />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">Invigilation · {title}</p>
                <h1 className="text-3xl font-semibold tracking-tight">Exam conditions</h1>
                <p>
                    Set browser controls before the first attempt. These controls cannot verify identity or
                    monitor other devices.
                </p>
            </header>
            <div className="assessment-split">
                <div className="assessment-panel">
                    {locked ? (
                        <section className="min-w-0 space-y-3">
                            <h2 className="text-xl font-semibold tracking-tight">Conditions in effect</h2>
                            <p>An attempt has started. Conditions are now fixed for this exam.</p>
                            <p>
                                Page visibility recording: {policy.observe_visibility ? 'on' : 'off'} · Copy
                                restriction: {policy.prevent_copy ? 'on' : 'off'}
                            </p>
                        </section>
                    ) : (
                        <Post url={url} button="Save exam conditions">
                            <h2 className="font-semibold">Sitting controls</h2>
                            <Label className="flex items-center gap-3 leading-normal">
                                <Checkbox
                                    name="observe_visibility"
                                    value="1"
                                    defaultChecked={policy.observe_visibility}
                                />
                                Record when the exam page becomes hidden
                            </Label>
                            <Label className="flex items-center gap-3 leading-normal">
                                <Checkbox
                                    name="prevent_copy"
                                    value="1"
                                    defaultChecked={policy.prevent_copy}
                                />
                                Prevent copying from the active exam page
                            </Label>
                        </Post>
                    )}
                </div>
                <VisibilityObservations signals={signals} url={url} />
            </div>
        </AssessmentWorkspace>
    );
}
