import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import type { Department, Programme, Selection, StructureProps } from './liveRecords';

export function DepartmentHierarchyRow({ department, programmes, studentCountSession, edit }: {
    department: Department;
    programmes: Programme[];
    studentCountSession: StructureProps['student_count_session'];
    edit: (selection: Selection) => void;
}) {
    const { programme_count: programmeCount, active_lecturer_count: lecturers, active_imported_student_count: students } = department;
    const useCodeTile = department.code.length <= 4;

    return (
        <li className="rounded-lg border border-ink-100 bg-ink-50/60 p-3">
            <div className="grid items-start justify-items-start gap-2 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center">
                <div className="min-w-0">
                    <p className="flex max-w-full flex-wrap items-center gap-2.5 text-[13px] font-medium text-ink-800">
                        {useCodeTile && (
                            <span className="grid min-h-7 min-w-7 max-w-full place-items-center rounded-md bg-white px-1.5 py-1 text-center text-[10px] font-bold wrap-anywhere text-ink-600">
                                {department.code}
                            </span>
                        )}
                        <span className="min-w-0 wrap-anywhere">{department.name}</span>
                    </p>
                    {!useCodeTile && (
                        <p className="mt-0.5 text-xs wrap-anywhere text-ink-600">{department.code}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs wrap-anywhere text-ink-600">
                        <span>{programmeCount} home {programmeCount === 1 ? 'programme' : 'programmes'}</span>
                        <span>{lecturers} active lecturer {lecturers === 1 ? 'account' : 'accounts'}</span>
                        {studentCountSession && students !== null && (
                            <span>
                                {students} active imported {students === 1 ? 'student' : 'students'} ({studentCountSession.label})
                            </span>
                        )}
                    </div>
                </div>
                <Action
                    variant="ghost"
                    size="sm"
                    aria-label={`Manage department ${department.name}`}
                    onClick={() => edit({ kind: 'departments', record: department })}
                >
                    Manage department
                </Action>
            </div>
            {programmes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 [&>.badge]:max-w-full [&>.badge]:wrap-anywhere [&>.badge]:whitespace-normal">
                    {programmes.map(programme => (
                        <Badge key={programme.id}>{programme.code}</Badge>
                    ))}
                </div>
            )}
        </li>
    );
}
