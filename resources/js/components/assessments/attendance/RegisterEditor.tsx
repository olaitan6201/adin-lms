import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { registerStatuses, type Learner, type RegisterMark, type RegisterStatus, type Session } from '@/types/assessments/attendance';
import { Drawer } from '../Controls';
import { SessionVerification } from './SessionVerification';
import type { Marks } from './registerMarks';

function LearnerMarkFieldset({ learner, value, change }: {
    learner: Learner;
    value: RegisterMark;
    change: (matric: string, status: RegisterStatus) => void;
}) {
    return (
        <fieldset className="py-3">
            <legend className="float-left mr-2 font-medium">{learner.name}</legend>
            <div className="flex clear-both flex-wrap gap-1 pt-2">
                {registerStatuses.map(status => {
                    const checked = value === status;
                    const color = checked ? 'border-brand-600 bg-brand-50' : 'border-ink-100';
                    return (
                        <label key={status} className={`rounded-md border px-2 py-1 text-xs capitalize ${color}`}>
                            <input type="radio" className="mr-1" name={learner.matric} checked={checked}
                                onChange={() => change(learner.matric, status)} />
                            {status}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

interface RegisterProps {
    session: Session;
    roster: Learner[];
    codeSuffix: string;
    initial: Marks;
    close: () => void;
    save: (marks: Marks) => void;
}

export function RegisterEditor({ session, roster, codeSuffix, initial, close, save }: RegisterProps) {
    const [marks, setMarks] = useState(initial);
    const enrolled = session.present + session.late + session.absent;

    function markAllPresent() {
        setMarks(previous => Object.fromEntries(Object.keys(previous).map(matric => [matric, 'present'])));
    }

    function saveRegister() {
        save(marks);
    }

    function changeMark(matric: string, status: RegisterStatus) {
        setMarks(previous => ({ ...previous, [matric]: status }));
    }

    return (
        <Drawer
            title={session.title}
            subtitle={`${session.course} · ${session.date}, ${session.time}`}
            close={close}
        >
            <Card
                title="Register"
                subtitle={`${enrolled} enrolled students`}
                actions={<>
                    <Action size="sm" onClick={markAllPresent}>All present</Action>
                    <Action size="sm" variant="primary" onClick={saveRegister}>Save register</Action>
                </>}
            >
                <div className="divide-y divide-slate-100">
                    {roster.map(learner => (
                        <LearnerMarkFieldset key={learner.matric} learner={learner}
                            value={marks[learner.matric]} change={changeMark} />
                    ))}
                </div>
            </Card>
            <SessionVerification course={session.course} codeSuffix={codeSuffix} />
            <p className="rounded-lg bg-sky-50 p-3 text-sm">
                A student marked excused keeps the session in their history but it does not count against their percentage.
            </p>
            <div className="flex justify-end gap-2">
                <Action onClick={close}>Close</Action>
                <Action variant="primary" onClick={saveRegister}>Save register</Action>
            </div>
        </Drawer>
    );
}
