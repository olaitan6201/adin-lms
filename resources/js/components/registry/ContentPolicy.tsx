import type { UploadGroup } from '@/types/registry/content';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Field, type Desk } from './Desk';
import { Records, status } from './Records';

export function ContentPolicy({
    desk,
    groups,
    selection,
    save,
}: {
    desk: Desk;
    groups: UploadGroup[];
    selection: Record<string, string[]>;
    save: (data: FormData) => void | string;
}) {
    const labels = (id: string) => selection[id].map((ext) => ext.toUpperCase()).join(', ');
    function editRules() {
        desk.show({
            title: 'Edit allow-list',
            submit: 'Save',
            body: groups
                .filter((group) => group.extensions)
                .map((group) => <Field key={group.id} label={group.label} value={labels(group.id)} />),
            save,
        });
    }

    return (
        <div>
            <Records
                footer={
                    <p className="mt-3 text-xs leading-relaxed text-ink-500">
                        This browser’s upload policy applies to file selection and drag and drop. Source code is
                        accepted only in permitted archives (for example, .java, .py, .js, .ts, .cpp, .cs, .sql,
                        .php, .rb and .go files inside a ZIP). Links are not file types.
                    </p>
                }
                title="Upload allow-list"
                subtitle="What a lecturer may attach, and the validation applied to each type"
                actions={
                    <>
                        {status('Limit 200 MB')}
                        <Action icon="settings" size="sm" onClick={editRules}>
                            Edit allow-list
                        </Action>
                    </>
                }
                columns={['Group', 'Accepted types', 'Validation']}
                rows={groups.map(({ id, label, extensions, description, validation }) => [
                    label,
                    extensions ? labels(id) || 'None' : description,
                    status(
                        validation,
                        validation === 'Media probed' ? 'sky' : validation === 'Type checked' ? 'slate' : 'emerald',
                    ),
                ])}
            />
        </div>
    );
}

export function Checklist({ items }: { items: string[][] }) {
    return (
        <Card
            title="Authoring completeness"
            subtitle="Structural checks the prototype runs against the SRS content requirements"
        >
            <ul className="divide-y divide-ink-100">
                {items.map(([label, value], i) => (
                    <li key={label} className="flex items-center justify-between gap-2 py-2 text-[13px]">
                        <span className="flex items-center gap-2">
                            <Icon name="check" className="size-4 text-brand-600" />
                            {label}
                        </span>
                        {status(value, i === 1 || i === 2 ? 'amber' : 'emerald')}
                    </li>
                ))}
            </ul>
        </Card>
    );
}
