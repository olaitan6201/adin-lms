import { Action } from '@/components/ui/controls/Action';
import type { Session } from '@/types/assessments/attendance';
import { exportSheet } from '@/lib/csv';

interface ReportProps {
    sessions: Session[];
    size?: 'sm';
}

export function AttendanceReport({ sessions, size }: ReportProps) {
    function download() {
        const columns = ['Class', 'Date', 'Present', 'Absent', 'Late'];
        const rows = sessions.map(({ title, date, present, absent, late }) => [
            title,
            date,
            present,
            absent,
            late,
        ]);
        exportSheet('attendance', columns, rows);
    }

    return (
        <Action size={size} icon="chart" onClick={download}>
            Attendance report
        </Action>
    );
}
