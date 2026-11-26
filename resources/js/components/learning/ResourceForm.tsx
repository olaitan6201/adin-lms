import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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
        <CourseDisclosure label={item ? 'Replace resource' : 'Add a resource'}>
            <EntryForm originalTimes={item} action={action} label="Save revision">
                <Label className="grid gap-2">
                    Resource title
                    <Input name="title" required maxLength={191} defaultValue={item?.title} />
                </Label>
                <Label className="grid gap-2">
                    Resource text
                    <Textarea name="body" />
                </Label>
                <Label className="grid gap-2">
                    External resource or quiz (HTTPS)
                    <Input type="url" name="external_url" />
                </Label>
                <Label className="grid gap-2">
                    Private attachment (up to 50 MiB)
                    <Input name="file" type="file" />
                </Label>
                <Label className="grid gap-2">
                    English captions (WebVTT, up to 1 MiB)
                    <Input name="caption" type="file" accept=".vtt,text/vtt" />
                </Label>
                <Label className="grid gap-2">
                    Transcript or descriptive alternative
                    <Textarea name="transcript" rows={4} />
                </Label>
                <Label className="grid gap-2">
                    Learner downloads
                    <NativeSelect name="download_allowed" defaultValue={item && !item.download_allowed ? '0' : '1'}>
                        <NativeSelectOption value="1">Allowed</NativeSelectOption>
                        <NativeSelectOption value="0">Disabled</NativeSelectOption>
                    </NativeSelect>
                </Label>
                <AvailabilityFields item={item} />
            </EntryForm>
        </CourseDisclosure>
    );
}
