import { useState } from 'react';
import type { Assignment, AssignmentDraft, Submission } from '@/types/assessments/assignments';
import { recordMark } from '../assignmentRecords';

export function useAssignmentRecords(
    assignments: Assignment[],
    submissions: Submission[],
    awaiting: number,
    enrolment: number,
) {
    const [records, setRecords] = useState({ rows: assignments, queue: submissions, awaiting });
    const { rows, queue } = records;
    const [edit, setEdit] = useState<Assignment | 'new'>();
    const [mark, setMark] = useState<Submission>();
    function saveAssignment(draft: AssignmentDraft) {
        if (!edit) {
            return;
        }

        const base =
            edit === 'new'
                ? {
                      id: crypto.randomUUID(),
                      marked: 0,
                      total: enrolment,
                      submissions: 0,
                      late: 0,
                      state: 'scheduled',
                  }
                : edit;
        const updated = { ...base, ...draft };
        setRecords((current) => ({
            ...current,
            rows:
                edit === 'new'
                    ? [...current.rows, updated]
                    : current.rows.map((row) => (row.id === updated.id ? updated : row)),
        }));
        setEdit(undefined);
    }

    function saveMark(updated: Submission) {
        setRecords((current) => recordMark(current, updated));
        setMark(undefined);
    }

    return {
        rows,
        queue,
        awaiting: records.awaiting,
        edit,
        setEdit,
        mark,
        setMark,
        saveMark,
        saveAssignment,
    };
}
