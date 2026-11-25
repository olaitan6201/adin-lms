import { LearnerTime } from '../components/LearnerTime';

type Limits = {
    opens_at: string;
    due_at: string;
    closes_at: string;
    accepted_formats: string[];
    max_bytes: number;
};

function uploadLimit(bytes: number) {
    const exact = `${bytes.toLocaleString()} ${bytes === 1 ? 'byte' : 'bytes'}`;
    if (bytes < 1024) return exact;
    const mib = bytes >= 1024 ** 2;
    const amount = bytes / (mib ? 1024 ** 2 : 1024);
    const value = amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return `${value} ${mib ? 'MiB' : 'KiB'} (${exact})`;
}

export function AssignmentLimits({ assignment }: { assignment: Limits }) {
    return (
        <>
            <dl className="my-4 grid gap-3 border-y border-border py-3 sm:grid-cols-3">
                <div>
                    <dt className="font-semibold">Opens</dt>
                    <dd><LearnerTime instant={assignment.opens_at} /></dd>
                </div>
                <div>
                    <dt className="font-semibold">Due</dt>
                    <dd><LearnerTime instant={assignment.due_at} /></dd>
                </div>
                <div>
                    <dt className="font-semibold">Submissions close</dt>
                    <dd><LearnerTime instant={assignment.closes_at} /></dd>
                </div>
            </dl>
            <p>Accepted files: {assignment.accepted_formats.join(', ')} · Maximum {uploadLimit(assignment.max_bytes)}</p>
        </>
    );
}
