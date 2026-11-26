import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';

type Department = {
    id: string;
    code: string;
    name: string;
    programmes: number;
    lecturers: number;
    students: number;
};

type Faculty = {
    id: string;
    code: string;
    name: string;
    head: string;
    departments: Department[];
};

type Programme = {
    id: string;
    department: string;
    code: string;
    level: number;
};

type DepartmentRowProps = {
    department: Department;
    programmes: Programme[];
};

function DepartmentRow({ department, programmes }: DepartmentRowProps) {
    return (
        <li className="rounded-lg border border-ink-100 bg-ink-50/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-md bg-white text-[10px] font-bold text-ink-600">
                        {department.code}
                    </span>
                    <span className="text-[13px] font-medium text-ink-800">{department.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
                    <span>{department.programmes} programmes</span>
                    <span aria-hidden className="text-ink-300">
                        |
                    </span>
                    <span>{department.lecturers} lecturers</span>
                    <span aria-hidden className="text-ink-300">
                        |
                    </span>
                    <span>{department.students} students</span>
                </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
                {programmes.map((programme) => (
                    <Badge key={programme.id}>
                        {programme.code} L{programme.level}
                    </Badge>
                ))}
            </div>
        </li>
    );
}

export function FacultyHierarchy({
    faculties,
    programmes,
    onOversight,
}: {
    faculties: Faculty[];
    programmes: Programme[];
    onOversight: (faculty: Faculty) => void;
}) {
    return (
        <div className="space-y-4">
            {faculties.map((faculty) => (
                <section key={faculty.id} className="rounded-xl border border-ink-100 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 [&_.btn-sm]:leading-5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-[11px] font-bold text-white">
                                {faculty.code}
                            </span>
                            <div>
                                <p className="text-[14px] font-semibold text-ink-900">{faculty.name}</p>
                                <p className="mt-0.5 text-xs text-ink-500">
                                    Head: {faculty.head} · {faculty.departments.length} departments
                                </p>
                            </div>
                        </div>
                        <Action icon="shield" variant="ghost" size="sm" onClick={() => onOversight(faculty)}>
                            Oversight scope
                        </Action>
                    </div>
                    <ul className="mt-4 space-y-2">
                        {faculty.departments.map((department) => (
                            <DepartmentRow
                                key={department.id}
                                department={department}
                                programmes={programmes.filter((p) => p.department === department.code)}
                            />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
