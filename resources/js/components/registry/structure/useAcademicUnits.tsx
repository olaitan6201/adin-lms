import { useState } from 'react';
import { type Desk, Field } from '@/components/registry/Desk';
import { val } from '@/components/registry/Records';
import type { Faculty, Programme } from '@/types/registry/structure';

export function useAcademicUnits({
    initialFaculties,
    initialProgrammes,
    desk,
}: {
    initialFaculties: Faculty[];
    initialProgrammes: Programme[];
    desk: Desk;
}) {
    const [faculties, setFaculties] = useState(initialFaculties);
    const [programmes, setProgrammes] = useState(initialProgrammes);

    function saveUnit(data: FormData) {
        const unit = { id: crypto.randomUUID(), name: val(data, 'Name'), code: val(data, 'Code') };
        if (val(data, 'Type') === 'Faculty') {
            if (
                faculties.some(
                    (f) =>
                        f.name.toLowerCase() === unit.name.toLowerCase() ||
                        f.code.toLowerCase() === unit.code.toLowerCase(),
                )
            )
                return 'A faculty with that name or code already exists.';

            const faculty = { ...unit, head: val(data, 'Head'), departments: [] };
            setFaculties((records) => [...records, faculty]);
            return;
        }

        const parent = val(data, 'Parent faculty');
        if (!faculties.some((f) => f.name === parent)) {
            return 'Select an existing faculty.';
        }

        if (faculties.some((f) => f.departments.some((d) => d.code.toLowerCase() === unit.code.toLowerCase())))
            return 'Department codes must be unique.';

        const department = { ...unit, programmes: 0, lecturers: 0, students: 0 };
        setFaculties((records) =>
            records.map((faculty) =>
                faculty.name === parent ? { ...faculty, departments: [...faculty.departments, department] } : faculty,
            ),
        );
    }

    function saveProgramme(data: FormData) {
        const department = val(data, 'Department');
        const faculty = faculties.find((unit) => unit.departments.some((child) => child.code === department));
        if (!faculty) {
            return 'Select an existing department.';
        }

        const programme = {
            id: crypto.randomUUID(),
            code: val(data, 'Code'),
            title: val(data, 'Programme'),
            department,
            faculty: faculty.code,
            level: Number(val(data, 'Level')),
            units: Number(val(data, 'Units')),
        };
        setFaculties((records) =>
            records.map((record) =>
                record.id === faculty.id
                    ? {
                          ...record,
                          departments: record.departments.map((child) =>
                              child.code === department ? { ...child, programmes: child.programmes + 1 } : child,
                          ),
                      }
                    : record,
            ),
        );
        setProgrammes((records) => [...records, programme]);
    }

    function addUnit() {
        desk.show({
            title: 'Add faculty or department',
            submit: 'Add',
            body: (
                <>
                    <Field label="Type" options={['Faculty', 'Department']} />
                    <Field label="Name" required />
                    <Field label="Code" required />
                    <Field label="Head" />
                    <Field label="Parent faculty" options={faculties.map((f) => f.name)} />
                </>
            ),
            save: saveUnit,
        });
    }

    function addProgramme() {
        desk.show({
            title: 'Add programme',
            submit: 'Add programme',
            body: (
                <>
                    <Field label="Programme" required />
                    <Field label="Code" required />
                    <Field label="Department" options={faculties.flatMap((f) => f.departments.map((d) => d.code))} />
                    <Field label="Level" options={['100', '200', '300', '400', '500']} />
                    <Field label="Units" type="number" required />
                </>
            ),
            save: saveProgramme,
        });
    }

    return { faculties, programmes, addUnit, addProgramme };
}
