import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
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
                    <Input name="title" required maxLength={191} defaultValue={item?.title} />
                </label>
                <label>
                    Resource text
                    <Textarea name="body" />
                </label>
                <label>
                    External resource or quiz (HTTPS)
                    <Input type="url" name="external_url" />
                </label>
                <label>
                    Private attachment (up to 50 MiB)
                    <Input name="file" type="file" />
                </label>
                <label>
                    English captions (WebVTT, up to 1 MiB)
                    <Input name="caption" type="file" accept=".vtt,text/vtt" />
                </label>
                <label>
                    Transcript or descriptive alternative
                    <Textarea name="transcript" rows={4} />
                </label>
                <label>
                    Learner downloads
                    <NativeSelect name="download_allowed" defaultValue={item && !item.download_allowed ? '0' : '1'}>
                        <option value="1">Allowed</option>
                        <option value="0">Disabled</option>
                    </NativeSelect>
                </label>
                <AvailabilityFields item={item} />
            </EntryForm>
        </details>
    );
}
