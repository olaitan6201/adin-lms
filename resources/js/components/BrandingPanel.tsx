import { Form, usePage } from '@inertiajs/react';

export default function BrandingPanel() {
    const { branding } = usePage<{ branding: { institution: string; logoFull: string } }>().props;

    return <section aria-labelledby="branding-heading" className="space-y-3">
        <h2 id="branding-heading" className="text-xl font-semibold">Institution identity</h2>
        <img className="h-12 max-w-full object-contain" src={branding.logoFull} alt={`Current logo: ${branding.institution}`} />
        <Form action="/operations/branding" method="post" resetOnSuccess={['logo', 'restore_logo']}>
            {({ errors, processing, recentlySuccessful }) => <div className="space-y-3">
                <label className="block">Displayed institution name
                    <input className="block w-full border p-2" name="institution" defaultValue={branding.institution}
                        maxLength={120} aria-invalid={!!errors.institution} aria-describedby="branding-name-help" />
                </label>
                <p id="branding-name-help">Leave blank to use the configured institution name.</p>
                {errors.institution && <p role="alert">{errors.institution}</p>}
                <label className="block">Replacement logo
                    <input className="block max-w-full" type="file" name="logo" accept="image/png,image/jpeg"
                        aria-invalid={!!errors.logo} aria-describedby="branding-logo-help" />
                </label>
                <p id="branding-logo-help">Choose a PNG or JPEG, up to 512 KB and 512 × 512 pixels. Leave empty to keep the current logo.</p>
                {errors.logo && <p role="alert">{errors.logo}</p>}
                <label className="block"><input type="checkbox" name="restore_logo" value="1" /> Restore the configured logo</label>
                {errors.restore_logo && <p role="alert">{errors.restore_logo}</p>}
                <button className="bg-teal-900 p-2 text-white" disabled={processing}>Save institution identity</button>
                {recentlySuccessful && <p role="status">Institution identity saved.</p>}
            </div>}
        </Form>
    </section>;
}
