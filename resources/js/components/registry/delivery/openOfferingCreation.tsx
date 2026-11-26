import { type Desk, Field } from '@/components/registry/Desk';
import { val } from '@/components/registry/Records';
import type { Offering } from '@/types/registry/delivery';

export function openOfferingCreation({
    courses,
    currentTerm,
    onCreate,
    desk,
}: {
    courses: {
        code: string;
        title: string;
    }[];
    currentTerm: string;
    onCreate: (offering: Offering) => void;
    desk: Desk;
}) {
    desk.show({
        title: 'New offering',
        submit: 'Create offering',
        body: (
            <>
                <Field label="Course" options={courses.map((c) => c.code)} />
                <Field label="Term" value={currentTerm} required />
                <Field label="Mode" options={['Blended', 'Online', 'Face-to-face']} />
            </>
        ),
        save: (d) => {
            const course = courses.find((record) => record.code === val(d, 'Course'));
            if (!course) return 'Select an available course to create an offering.';

            onCreate({
                id: crypto.randomUUID(),
                code: course.code,
                title: course.title,
                instructor: 'Unassigned',
                students: 0,
                sessions: 0,
                completion: 0,
                state: 'draft',
                mode: val(d, 'Mode'),
                term: val(d, 'Term'),
                assistants: 'None',
                scope: 'Assigned class only',
            });
        },
    });
}
