import { MeasureBars } from '@/components/overview/InsightPanel';

type AttendanceProps = {
    columns: string[];
    rows: (string | number)[][];
};

export function AttendanceSummary({ columns, rows }: AttendanceProps) {
    const attendance = ['Present', 'Absent', 'Excused', 'Unmarked'];
    const attendanceCounts = attendance.every((label) => columns.includes(label))
        ? Object.fromEntries(
              attendance.map((label) => {
                  const index = columns.indexOf(label);
                  return [label, rows.reduce<number>((total, row) => total + Number(row[index]), 0)];
              }),
          )
        : null;
    if (!attendanceCounts) {
        return null;
    }

    return (
        <figure className="mb-5 rounded-xl bg-ink-50 p-4">
            <figcaption className="mb-3">
                <strong className="card-title">Attendance across reported classes</strong>
                <span className="card-subtitle block">
                    One record per registered learner per class. Unmarked records are shown separately.
                </span>
            </figcaption>
            <MeasureBars values={attendanceCounts} />
        </figure>
    );
}
