import { Icon } from '@/components/icons/Icon';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { Selection, StructureProps } from './liveRecords';

const healthTones = {
    complete: { classes: 'border-brand-200 bg-brand-50/60 text-brand-900', icon: 'check' },
    missing: { classes: 'border-amber-200 bg-amber-50/60 text-amber-900', icon: 'alert' },
    empty: { classes: 'border-ink-100 bg-ink-50 text-ink-700', icon: null },
};

function HealthCheck({ title, count, total, complete, empty }: {
    title: string;
    count: number;
    total: number;
    complete: string;
    empty: string;
}) {
    const tone = total === 0 ? healthTones.empty : count === total ? healthTones.complete : healthTones.missing;

    return (
        <li className={`flex items-start gap-2.5 rounded-xl border p-3 ${tone.classes}`}>
            {tone.icon && <Icon name={tone.icon} className="mt-0.5 size-4 shrink-0" />}
            <div>
                <p className="text-[13px] font-semibold">{title}</p>
                <p className="mt-0.5 text-xs">
                    {total === 0 ? empty : `${count} of ${total} ${complete}.`}
                    {count < total && ` ${total - count} missing.`}
                </p>
            </div>
        </li>
    );
}

type HealthRecords = Pick<StructureProps, 'faculties' | 'departments' | 'programmes' | 'levels' | 'sessions' | 'semesters' | 'health'>;

export function StructureHealthSummary({ records, edit }: {
    records: HealthRecords;
    edit: (selection: Selection) => void;
}) {
    const facultiesWithDepartments = new Set(records.departments.map(department => department.faculty_id));
    const sessionsWithSemesters = new Set(records.semesters.map(semester => semester.session_id));
    const emptyFaculties = records.faculties.filter(faculty => !facultiesWithDepartments.has(faculty.id)).length;
    const emptySessions = records.sessions.filter(session => !sessionsWithSemesters.has(session.id)).length;

    return (
        <Card title="Structure health" subtitle="Checks run on the current structure">
            <ul className="space-y-3">
                <HealthCheck
                    title="Department leadership"
                    count={records.health.departments_with_active_hod}
                    total={records.departments.length}
                    complete="departments have an active head"
                    empty="No departments to check."
                />
                <HealthCheck
                    title="Legacy curriculum approval"
                    count={records.health.programmes_with_approved_curriculum}
                    total={records.programmes.length}
                    complete="programmes have an approved curriculum"
                    empty="No programmes to check."
                />
            </ul>
            <div className="mt-4 space-y-3 rounded-xl border border-ink-100 p-3.5">
                <dl className="space-y-2 text-sm text-ink-700">
                    <div className="flex justify-between gap-3">
                        <dt>Faculties without departments</dt>
                        <dd className="font-medium tabular-nums">{emptyFaculties}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt>Sessions without semesters</dt>
                        <dd className="font-medium tabular-nums">{emptySessions}</dd>
                    </div>
                </dl>
                <div className="space-y-2 border-t border-ink-100 pt-3">
                    <h3 className="text-sm font-semibold">Legacy academic levels</h3>
                    {records.levels.length === 0 ? (
                        <p className="text-sm text-ink-600">No levels configured.</p>
                    ) : (
                        <ul className="flex flex-wrap gap-1 [&_.btn]:max-w-full [&_.btn]:wrap-anywhere">
                            {records.levels.map(level => (
                                <li key={level.id} className="max-w-full">
                                    <Action size="sm" onClick={() => edit({ kind: 'levels', record: level })}>
                                        {level.label}
                                    </Action>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Action size="sm" onClick={() => edit({ kind: 'levels' })}>Add level</Action>
                </div>
            </div>
        </Card>
    );
}
