import { EntryForm } from './EntryForm';
import { AvailabilityFields } from './AvailabilityFields';
import type { Material } from './contracts';

interface ResourceFormProps {
    action: string;
    item?: Material;
}

export function ResourceForm({ action, item }: ResourceFormProps) {
    return (
        <details>
            <summary>{item ? 'Replace resource' : 'Add a resource'}</summary>
            <EntryForm action={action} label="Save revision">
                <label>
                    Resource title
                    <input name="title" required maxLength={191} defaultValue={item?.title} />
                </label>
                <label>
                    Resource text
                    <textarea name="body" />
                </label>
                <label>
                    External resource or quiz (HTTPS)
                    <input type="url" name="external_url" />
                </label>
                <label>
                    Private attachment (up to 50 MiB)
                    <input name="file" type="file" />
                </label>
                <label>
                    Learner downloads
                    <select
                        name="download_allowed"
                        defaultValue={item && !item.download_allowed ? '0' : '1'}
                    >
                        <option value="1">Allowed</option>
                        <option value="0">Disabled</option>
                    </select>
                </label>
                <AvailabilityFields item={item} />
            </EntryForm>
        </details>
    );
}
