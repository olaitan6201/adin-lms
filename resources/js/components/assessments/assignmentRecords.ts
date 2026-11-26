import type { Assignment, Submission } from '@/types/assessments/assignments';

interface AssignmentRecords {
    rows: Assignment[];
    queue: Submission[];
    awaiting: number;
}

function countsAsMarked(submission: Submission) {
    return submission.status === 'feedback returned' || submission.status === 'marked';
}

export function recordMark(records: AssignmentRecords, updated: Submission): AssignmentRecords {
    const previous = records.queue.find((script) => script.id === updated.id);
    if (!previous || previous.assignmentId !== updated.assignmentId) {
        return records;
    }

    const delta = Number(countsAsMarked(updated)) - Number(countsAsMarked(previous));
    return {
        queue: records.queue.map((script) => (script.id === updated.id ? updated : script)),
        rows: records.rows.map((row) =>
            row.id === updated.assignmentId
                ? { ...row, marked: Math.max(0, Math.min(row.submissions, row.marked + delta)) }
                : row,
        ),
        awaiting: Math.max(0, records.awaiting - delta),
    };
}
