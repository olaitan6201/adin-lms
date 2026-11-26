import { useState, type FormEvent } from 'react';
import type { Forum } from '@/types/community/communication';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';
import { selectedCourse } from './communityCourses';

type Props = {
    courses: string[];
    close: () => void;
    save: (forum: Forum) => void;
};
export function ForumEditor({ courses, close, save }: Props) {
    const [courseError, setCourseError] = useState('');
    function createForum(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const course = selectedCourse(fields, courses);
        if (!course) {
            setCourseError('Select an available course.');
            return;
        }

        const created: Forum = {
            id: crypto.randomUUID(),
            title: String(fields.get('title')).trim(),
            course,
            threads: 0,
            posts: 0,
            last: 'Created just now',
            pinned: false,
        };
        save(created);
    }

    return (
        <Drawer title="New forum" close={close}>
            <form className="space-y-4" onSubmit={createForum}>
                <Field label="Forum title">
                    <input name="title" className="input" required pattern=".*\S.*" />
                </Field>
                <Field label="Course">
                    <select name="course" className="select" required onChange={() => setCourseError('')}>
                        {courses.map((course) => (
                            <option key={course}>{course}</option>
                        ))}
                    </select>
                </Field>
                {courseError && <p role="alert">{courseError}</p>}
                <button className="btn btn-primary" disabled={!courses.length}>
                    Create forum
                </button>
            </form>
        </Drawer>
    );
}
