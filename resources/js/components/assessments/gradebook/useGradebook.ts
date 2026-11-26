import { useState } from 'react';
import type { GradePolicy, GradeRow, Metric, ScoreChange } from '@/types/assessments/gradebook';

type Book = { rows: GradeRow[]; history: ScoreChange[] };
type Revision = { rows: GradeRow[]; change: string; reason: string };
export type MarkerDecision = 'Approve' | 'Send for moderation';

export function useGradebook(initial: Book, policy: GradePolicy, lecturer: boolean) {
    const [book, setBook] = useState(initial);

    function commit(revise: (rows: GradeRow[]) => Revision | undefined) {
        const when = new Date().toLocaleString();
        const who = lecturer ? 'Lecturer' : 'Examination officer';

        setBook(current => {
            const revision = revise(current.rows);
            if (!revision) return current;
            const { rows, change, reason } = revision;
            return { rows, history: [{ when, who, change, reason }, ...current.history] };
        });
    }

    function adjustScore(matric: string, [key, , maximum]: Metric, value: number) {
        commit(rows => {
            const row = rows.find(result => result.matric === matric);
            if (!row || row.state === 'published' || value === row[key]) return;
            if (!Number.isInteger(value) || value < 0 || value > maximum) return;
            const total = row.total - row[key] + value;
            const grade = policy.boundaries.find(([, min]) => total >= min)?.[0] ?? 'F';
            return {
                rows: rows.map(result => result === row ? { ...row, [key]: value, total, grade, state: 'moderation' } : result),
                change: `${matric}: ${key} ${row[key]} to ${value}`,
                reason: 'Score sheet adjustment; moderation required',
            };
        });
    }

    function secondMark(matric: string, decision: MarkerDecision, reason: string) {
        commit(rows => {
            const row = rows.find(result => result.matric === matric);
            if (!row || row.state === 'published' || !reason.trim()) return;
            if (lecturer && decision === 'Approve') return;
            const state = decision === 'Approve' ? 'approved' : 'moderation';
            return {
                rows: rows.map(result => result === row ? { ...row, state } : result),
                change: `${row.student} (${matric}): ${decision}`,
                reason: reason.trim(),
            };
        });
    }

    function publishApproved() {
        commit(rows => {
            const count = rows.filter(row => row.state === 'approved').length;
            if (lecturer || !count) return;
            return {
                rows: rows.map(row => row.state === 'approved' ? { ...row, state: 'published' } : row),
                change: `${count} result(s) published`,
                reason: 'Approved result release',
            };
        });
    }

    return { ...book, adjustScore, secondMark, publishApproved };
}
