import type { FormEvent } from 'react';
import type { Group } from '@/types/community/communication';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

export function GroupEditor({ groups, create, close }: { groups: Group[]; create: (group: Group) => void; close: () => void }) {
    function createGroup(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const name = String(d.get('name')).trim();
        if (groups.some((g) => g.name === name)) {
            const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement;
            input.setCustomValidity('Choose a different group name.');
            input.reportValidity();
            return;
        }
        create({
            id: crypto.randomUUID(),
            name,
            course: String(d.get('course')),
            members: ['You'],
            posts: 0,
            sharedFiles: 0,
            task: String(d.get('task')),
            due: '',
            lastActivity: 'Created just now',
        });
    }

    return (
        <Drawer title="Create group" close={close}>
            <form className="space-y-4" onSubmit={createGroup}>
                <Field label="Group name">
                    <input
                        name="name"
                        className="input"
                        required
                        pattern=".*\S.*"
                        onInput={(e) => e.currentTarget.setCustomValidity('')}
                    />
                </Field>
                <Field label="Course">
                    <select name="course" className="select">
                        {[...new Set(groups.map((g) => g.course))].map((c) => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Group task">
                    <textarea name="task" className="input" required />
                </Field>
                <button className="btn btn-primary">Create group</button>
            </form>
        </Drawer>
    );
}
