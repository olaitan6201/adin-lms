import { Card } from '@/components/ui/layout/Card';
import type { AttendanceBand } from '@/types/assessments/attendance';

export function AttendanceDistribution({ bands }: { bands: readonly AttendanceBand[] }) {
    const total = bands.reduce((sum, band) => sum + band.count, 0);
    const belowThreshold = bands.filter(band => band.upperExclusive !== null && band.upperExclusive <= 50);
    const belowThresholdCount = belowThreshold.reduce((sum, band) => sum + band.count, 0);

    return (
        <Card
            className="attendance-distribution"
            title="Attendance distribution"
            subtitle="Students by attendance band across the semester"
        >
            {bands.map(({ label, count, color }) => (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-3 py-1.5">
                    <div>
                        <p className="mb-1 text-[13px] font-medium text-ink-700">{label}</p>
                        <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                            <div
                                className={`h-full rounded-full ${color}`}
                                style={{ width: `${total ? count / total * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <span className="tnum text-right text-[13px] font-semibold text-ink-800">{count}</span>
                </div>
            ))}
            {belowThreshold.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                    <p className="text-[13px] font-semibold text-amber-900">{belowThresholdCount} students below 50%</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
                        Heads of department are notified for students below the threshold,
                        and the register export is attached to that notification.
                    </p>
                </div>
            )}
            {!bands.length && <p>No attendance distribution available.</p>}
        </Card>
    );
}
