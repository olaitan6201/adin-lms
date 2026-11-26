import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormFeedback, useFieldFeedback } from '@/components/forms/FormFeedback';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, usePage } from '@inertiajs/react';
import { useState } from 'react';

function IdentityFields({ institution }: { institution: string }) {
    const nameFeedback = useFieldFeedback('institution', 'branding-name-help');
    const logoFeedback = useFieldFeedback('logo', 'branding-logo-help');

    return (
        <>
            <Label htmlFor="branding-name">Displayed institution name</Label>
            <Input
                id="branding-name"
                name="institution"
                defaultValue={institution}
                maxLength={120}
                aria-describedby="branding-name-help"
                {...nameFeedback}
            />
            <p id="branding-name-help" className="text-sm text-muted-foreground">
                Leave blank to use the configured institution name.
            </p>
            <Label htmlFor="branding-logo">Replacement logo</Label>
            <Input
                id="branding-logo"
                type="file"
                name="logo"
                accept="image/png,image/jpeg"
                aria-describedby="branding-logo-help"
                {...logoFeedback}
            />
            <p id="branding-logo-help" className="text-sm text-muted-foreground">
                Choose a PNG or JPEG, up to 512 KB and 512 × 512 pixels. Leave empty to keep the current logo.
            </p>
        </>
    );
}

export default function BrandingPanel() {
    const { branding } = usePage<{
        branding: {
            institution: string;
            logoFull: string;
        };
    }>().props;
    const [restore, setRestore] = useState(false);

    return (
        <Card role="region" aria-labelledby="branding-heading">
            <CardContent className="grid gap-3">
                <h2 id="branding-heading" className="text-xl font-semibold">
                    Institution identity
                </h2>
                <img
                    className="h-12 max-w-full justify-self-start object-contain"
                    src={branding.logoFull}
                    alt={`Current logo: ${branding.institution}`}
                />
                <Form
                    className="grid max-w-2xl gap-3"
                    action="/operations/branding"
                    method="post"
                    resetOnSuccess={['logo']}
                    onSuccess={() => setRestore(false)}
                >
                    {({ errors, processing, recentlySuccessful }) => (
                        <FormFeedback errors={errors}>
                            <IdentityFields institution={branding.institution} />
                            <Label htmlFor="restore-logo">
                                <Checkbox
                                    id="restore-logo"
                                    name="restore_logo"
                                    value="1"
                                    checked={restore}
                                    onCheckedChange={(value) => setRestore(value === true)}
                                />
                                Restore the configured logo
                            </Label>
                            <Button disabled={processing}>Save institution identity</Button>
                            {recentlySuccessful && <p role="status">Institution identity saved.</p>}
                        </FormFeedback>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
