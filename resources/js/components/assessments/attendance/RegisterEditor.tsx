import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { Learner, Session } from '@/types/assessments/attendance';
import { Drawer } from '../Controls';
import { SessionVerification } from './SessionVerification';
import type { Marks } from './registerMarks';

const statuses = ['present', 'late', 'absent', 'excused'] as const;

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
                    {roster.map(({ name, matric }) => (
                        <fieldset key={matric} className="py-3">
                            <legend className="float-left mr-2 font-medium">{name}</legend>
                            <div className="flex clear-both flex-wrap gap-1 pt-2">
                                {statuses.map(status => {
                                    const checked = marks[matric] === status;
                                    const color = checked ? 'border-brand-600 bg-brand-50' : 'border-ink-100';
                                    return (
                                        <label
                                            key={status}
                                            className={`rounded-md border px-2 py-1 text-xs capitalize ${color}`}
                                        >
                                            <input
                                                type="radio"
                                                className="mr-1"
                                                name={matric}
                                                checked={checked}
                                                onChange={() => setMarks(previous => ({ ...previous, [matric]: status }))}
                                            />
                                            {status}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>
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
