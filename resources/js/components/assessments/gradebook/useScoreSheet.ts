import { useState } from 'react';
import { exportSheet } from '@/lib/csv';
import type { GradeRow, Metric } from '@/types/assessments/gradebook';

export function useScoreSheet(rows: GradeRow[], metrics: readonly Metric[], course: string) {
    const [state, filter] = useState('');
    const [tool, setTool] = useState('');
    const [search, find] = useState('');
    const visible = rows.filter(
        (r) =>
            (!state || r.state === state) &&
            `${r.student} ${r.matric}`.toLowerCase().includes(search.toLowerCase()),
    );
    function download() {
        exportSheet(
            `${course}-results`,
            ['Student', 'Matric', ...metrics.map(([, label]) => label), 'Total', 'Recorded grade', 'State'],
            visible.map((r) => [
                r.student,
                r.matric,
                ...metrics.map(([key]) => r[key]),
                r.total,
                r.grade,
                r.state,
            ]),
        );
    }
    return { visible, filters: { state, tool, search, filter, setTool, find }, download };
}
