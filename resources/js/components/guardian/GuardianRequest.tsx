import type { FormEvent } from 'react';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { download } from '@/lib/download';

const requests = {
    question: {
        title: 'Ask a question',
        recipient: 'Student support',
        prompt: 'Question about approved progress',
    },
    consent: {
        title: 'Manage consent',
        recipient: 'Registrar',
        prompt: 'Requested consent review',
    },
    result: {
        title: 'Report an issue',
        recipient: 'Examinations Office',
        prompt: 'Issue with the published result',
    },
} as const;

export type RequestKind = keyof typeof requests;

interface RequestProps {
    kind: RequestKind;
    student: string;
    consent: string;
    courses: readonly string[];
    close: () => void;
    finished: () => void;
}

export function GuardianRequest({ kind, student, consent, courses, close, finished }: RequestProps) {
    const request = requests[kind];

    function prepareRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const details = String(fields.get('details') ?? '').trim();
        if (!details) {
            return;
        }

        const course = fields.get('course');
        const content = [
            `${request.title} — sample request`,
            `To: ${request.recipient}`,
            `Student: ${student}`,
            ...(typeof course === 'string' && courses.includes(course) ? [`Published result: ${course}`] : []),
            '',
            details,
        ].join('\n');
        download(`guardian-${kind}-request.txt`, content, 'text/plain;charset=utf-8');
        finished();
    }

    return (
        <Drawer title={request.title} subtitle={`Prepare a request for ${request.recipient}.`} close={close}>
            <p>This sample downloads a draft for you. It does not send a message or change access.</p>
            {kind === 'consent' && (
                <p>
                    {consent}. Only the Registrar can change the approved scope.
                </p>
            )}
            <form className="grid gap-4" onSubmit={prepareRequest}>
                {kind === 'result' && (
                    <label className="grid gap-1">
                        Published result
                        <select className="select" name="course" required>
                            {courses.map(course => (
                                <option key={course}>{course}</option>
                            ))}
                        </select>
                    </label>
                )}
                <label className="grid gap-1">
                    {request.prompt}
                    <textarea
                        className="input"
                        name="details"
                        rows={4}
                        required
                    />
                </label>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={kind === 'result' && !courses.length}
                >
                    Download request
                </button>
            </form>
        </Drawer>
    );
}
