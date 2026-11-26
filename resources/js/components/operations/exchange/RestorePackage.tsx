import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { FormEventHandler } from 'react';

type RestoreProps = {
    csrf: string;
    uploadLimit: number;
    disabled: boolean;
    onSubmit: FormEventHandler<HTMLFormElement>;
};

export function RestorePackage({ csrf, uploadLimit, disabled, onSubmit }: RestoreProps) {
    return (
        <Card>
            <CardContent>
                <form onSubmit={onSubmit} className="min-w-0 space-y-4">
                    <h2 className="text-xl font-semibold">Restore to a draft</h2>
                    <p>Choose an empty draft with no enrolments, lessons, forums, classes or gradebook. Nothing is overwritten.</p>
                    <input type="hidden" name="_token" value={csrf} />
                    <Label className="grid gap-2">
                        Package (up to {(uploadLimit / 1048576).toFixed(1)} MiB)
                        <Input
                            required
                            type="file"
                            accept=".zip,.imscc"
                            name="package"
                        />
                    </Label>
                    <Button disabled={disabled}>Restore package</Button>
                </form>
            </CardContent>
        </Card>
    );
}
