import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { type Format } from '@/hooks/operations/useCourseTransfer';
import type { FormEventHandler } from 'react';

type DownloadProps = {
    format: Format;
    setFormat: (format: Format) => void;
    busy: boolean;
    disabled: boolean;
    onSubmit: FormEventHandler<HTMLFormElement>;
};

export function DownloadPackage({ format, setFormat, busy, disabled, onSubmit }: DownloadProps) {
    return (
        <Card>
            <CardContent>
                <form onSubmit={onSubmit} className="min-w-0 space-y-4">
                    <h2 className="text-xl font-semibold">Download a package</h2>
                    <Label className="grid gap-2">
                        Format
                        <NativeSelect value={format} disabled={busy} onChange={(e) => setFormat(e.target.value as Format)}>
                            <NativeSelectOption value="native">Adin course backup</NativeSelectOption>
                            <NativeSelectOption value="scorm">SCORM 1.2 text assets</NativeSelectOption>
                        </NativeSelect>
                    </Label>
                    <p>
                        {format === 'native'
                            ? 'Current lessons and attachments, course forums, assignment briefs and reference files, exam definitions and course question banks. Assessment archives contain private answer keys; you need exchange permission and teaching authority for the selected offering.'
                            : 'Unscheduled text chapters only. A chapter with linked or attached material cannot be exported in this format.'}
                    </p>
                    <Button disabled={disabled}>Download package</Button>
                </form>
            </CardContent>
        </Card>
    );
}
