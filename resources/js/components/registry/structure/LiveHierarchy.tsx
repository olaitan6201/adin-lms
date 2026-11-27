import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { DepartmentHierarchyRow } from './DepartmentHierarchyRow';
import { OversightScopeDrawer } from './OversightScopeDrawer';
import type { Selection, StructureProps } from './liveRecords';

type Hierarchy = Pick<StructureProps, 'faculties' | 'departments' | 'programmes' | 'student_count_session'>;

export function LiveHierarchy({ records, edit }: {
    records: Hierarchy;
    edit: (selection: Selection) => void;
}) {
    const { faculties, departments, programmes, student_count_session: studentCountSession } = records;
    const [oversightFacultyId, setOversightFacultyId] = useState<string | null>(null);
    const oversightFaculty = faculties.find(faculty => faculty.id === oversightFacultyId);

    return (
        <Card
            title="Institution hierarchy"
            subtitle="Faculties, departments and legacy programme assignments"
            className="@container [&>.card-head]:flex-col @2xl:[&>.card-head]:flex-row"
            actions={
                <>
                    <Badge tone="emerald">{faculties.length} faculties</Badge>
                    <Badge>{departments.length} departments</Badge>
                    <Badge>{programmes.length} programmes</Badge>
                </>
            }
        >
            <div className="space-y-4">
                {faculties.length === 0 && <p className="text-sm text-ink-600">No faculties have been added.</p>}
                {faculties.map(faculty => {
                    const children = departments.filter(department => department.faculty_id === faculty.id);
                    const useCodeTile = faculty.code.length <= 4;

                    return (
                        <section key={faculty.id} className="rounded-xl border border-ink-100 bg-white p-4">
                            <div className="grid items-start gap-2 @2xl:grid-cols-[minmax(0,1fr)_auto]">
                                <div className="min-w-0">
                                    <h3 className="flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-ink-900">
                                        {useCodeTile && (
                                            <span className="grid min-h-9 min-w-9 max-w-full place-items-center rounded-lg bg-ink-900 px-2 py-1 text-center text-[11px] font-bold wrap-anywhere text-white">
                                                {faculty.code}
                                            </span>
                                        )}
                                        <span className="min-w-0 wrap-anywhere">{faculty.name}</span>
                                    </h3>
                                    {!useCodeTile && (
                                        <p className="mt-0.5 text-xs wrap-anywhere text-ink-600">{faculty.code}</p>
                                    )}
                                    <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs wrap-anywhere text-ink-600">
                                        <span>
                                            {faculty.dean_names.length > 0
                                                ? `Dean: ${faculty.dean_names.join(', ')}`
                                                : 'No active dean assigned.'}
                                        </span>
                                        <span>{children.length} {children.length === 1 ? 'department' : 'departments'}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-x-2">
                                    <Action
                                        icon="shield"
                                        variant="ghost"
                                        size="sm"
                                        aria-label={`Oversight scope for ${faculty.name}`}
                                        onClick={() => setOversightFacultyId(faculty.id)}
                                    >
                                        Oversight scope
                                    </Action>
                                    <Action
                                        variant="ghost"
                                        size="sm"
                                        aria-label={`Manage faculty ${faculty.name}`}
                                        onClick={() => edit({ kind: 'faculties', record: faculty })}
                                    >
                                        Manage faculty
                                    </Action>
                                </div>
                            </div>
                            {children.length === 0 ? (
                                <p className="mt-3 text-sm text-ink-600">No departments yet.</p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {children.map(department => (
                                        <DepartmentHierarchyRow
                                            key={department.id}
                                            department={department}
                                            programmes={programmes.filter(programme => programme.department_id === department.id)}
                                            studentCountSession={studentCountSession}
                                            edit={edit}
                                        />
                                    ))}
                                </ul>
                            )}
                        </section>
                    );
                })}
            </div>
            {oversightFaculty && (
                <OversightScopeDrawer
                    faculty={oversightFaculty}
                    departments={departments.filter(department => department.faculty_id === oversightFaculty.id)}
                    close={() => setOversightFacultyId(null)}
                />
            )}
        </Card>
    );
}
