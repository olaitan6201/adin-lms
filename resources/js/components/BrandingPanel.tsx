import { FormFeedback } from '@/components/ui/form-feedback';
import { Input } from '@/components/ui/input';
import { NativeCheckbox } from '@/components/ui/native-checkbox';
import { Button } from '@/components/ui/button';
import { Form, usePage } from '@inertiajs/react';

export default function BrandingPanel() {
    const { branding } = usePage<{ branding: { institution: string; logoFull: string } }>().props;

    return <section aria-labelledby="branding-heading" className="portal-panel desk-shelf space-y-3">
        <h2 id="branding-heading" className="desk-section">Institution identity</h2>
        <img className="h-12 max-w-full object-contain" src={branding.logoFull} alt={`Current logo: ${branding.institution}`} />
        <Form className="grid max-w-2xl gap-3" action="/operations/branding" method="post" resetOnSuccess={['logo', 'restore_logo']}>
            {({ errors, processing, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    <label className="block">Displayed institution name
                        <Input name="institution" defaultValue={branding.institution}
                            maxLength={120} aria-invalid={!!errors.institution} aria-describedby="branding-name-help" />
                    </label>
                    <p id="branding-name-help">Leave blank to use the configured institution name.</p>
                    <label className="block">Replacement logo
                        <Input className="max-w-full" type="file" name="logo" accept="image/png,image/jpeg"
                            aria-invalid={!!errors.logo} aria-describedby="branding-logo-help" />
                    </label>
                    <p id="branding-logo-help">Choose a PNG or JPEG, up to 512 KB and 512 × 512 pixels. Leave empty to keep the current logo.</p>
                    <label className="block"><NativeCheckbox name="restore_logo" value="1" /> Restore the configured logo</label>
                    <Button disabled={processing}>Save institution identity</Button>
                    {recentlySuccessful && <p role="status">Institution identity saved.</p>}
                </FormFeedback>
            )}
        </Form>
    </section>;
}
