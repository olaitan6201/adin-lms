import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { WindowedAssignment, Receipt, StudentRevision } from '@/types/assessments/assignments';
import { formatInstitutionalTime, submissionWindow } from '@/lib/submissionWindow';
import { Drawer } from './Drawer';
import { inputClass, submitClass } from './Editor';

export function SubmissionPanel({
    row,
    revision,
    previous,
    close,
    save,
    sizeLimit,
    sampleTime,
}: {
    sizeLimit: number;
    row: WindowedAssignment;
    sampleTime: number;
    revision?: StudentRevision;
    previous: StudentRevision[];
    close: () => void;
    save: (r: Receipt) => void;
}) {
    const receipt = revision?.receipt;
    const window = submissionWindow(row, sampleTime);
    const accepting = window === 'Open';
    const [file, setFile] = useState<File>();
    const [note, setNote] = useState(receipt?.note ?? '');
    const [error, setError] = useState('');
    function chooseFile(next?: File) {
        setFile(next);
        setError('');
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!accepting) {
            return;
        }

        if (!file || !/\.(pdf|docx|xlsx)$/i.test(file.name) || file.size > sizeLimit * 1024 * 1024) {
            setError(`Choose a PDF, DOCX or XLSX file no larger than ${sizeLimit} MB.`);
            return;
        }

        save({
            issuedAt: sampleTime,
            number: `RCP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            file: file.name,
            size: `${(file.size / 1048576).toFixed(1)} MB`,
            time: `${formatInstitutionalTime(sampleTime)} WAT`,
            note,
        });
    }

    return (
        <Drawer title={row.title} subtitle={`${row.course} · closes ${row.due}`} close={close}>
            <Card title="Instructions">
                <p>
                    {row.instructions ??
                        `Submit your ${row.course} work for “${row.title}” in an accepted format.`}
                </p>
            </Card>
            {!accepting && (
                <p>{window === 'Not open yet' ? 'Not open yet. Submissions are unavailable.' : 'Submissions are closed.'}</p>
            )}
            <p className="text-xs text-ink-500">
                Sample clock: {formatInstitutionalTime(sampleTime)} WAT. Files are not uploaded in this sample.
            </p>
            <form className="space-y-4" onSubmit={submit}>
                {accepting && (
                    <label
                        className="block rounded-xl border-2 border-dashed border-ink-200 p-5 text-sm font-medium"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            chooseFile(e.dataTransfer.files[0]);
                        }}
                    >
                        Drop your file here or browse
                        <small className="block py-2">PDF, DOCX or XLSX up to {sizeLimit} MB</small>
                        <input
                            className="max-w-full"
                            type="file"
                            accept=".pdf,.docx,.xlsx"
                            required={!file}
                            onChange={(e) => chooseFile(e.target.files?.[0])}
                        />
                        {file && <span>{file.name}</span>}
                    </label>
                )}
                {receipt && (
                    <Card title="Existing submission">
                        <p>
                            {receipt.file} · {receipt.size} · uploaded {receipt.time}
                        </p>
                        <p className="mt-2 font-mono text-xs">Receipt no. {receipt.number}</p>
                        <p>
                            {revision?.feedback
                                ? `Graded ${revision.feedback.score} / 100`
                                : 'Awaiting marking'}
                        </p>
                    </Card>
                )}
                {previous.length > 0 && (
                    <details>
                        <summary>Previous receipts ({previous.length})</summary>
                        <ul>
                            {previous.map(({ receipt: prior }) => (
                                <li key={prior.number}>{prior.file} · {prior.time} · {prior.number}</li>
                            ))}
                        </ul>
                    </details>
                )}
                {accepting && (
                    <>
                        <label className="block text-sm">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">
                                Note to your lecturer
                            </span>
                            <textarea
                                className={inputClass}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Optional message"
                            />
                        </label>
                        {error && <p role="alert">{error}</p>}
                        <Action onClick={close}>Cancel</Action>{' '}
                        <button className={submitClass}>Submit work</button>
                    </>
                )}
            </form>
        </Drawer>
    );
}
