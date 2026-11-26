import { PortalField } from '@/components/forms/PortalForm';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Button } from '@/components/ui/button';
import { Form } from '@inertiajs/react';

export function ActivityPeriod({ staffId, from, until }: {
    staffId: string;
    from: string;
    until: string
}) {
    return (
        <aside className="course-panel course-pad space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Reporting period</h2>
            <Form method="get" action={`/staff/${staffId}/activity`} className="mt-4 grid gap-3">
                {({ errors, processing }) => (
                    <FormFeedback errors={errors}>
                        <PortalField
                            label="From"
                            type="date"
                            name="from"
                            defaultValue={from}
                            required
                            error={errors.from}
                            announceError={false}
                        />
                        <PortalField
                            label="Through"
                            type="date"
                            name="until"
                            defaultValue={until}
                            required
                            error={errors.until}
                            announceError={false}
                        />
                        <Button disabled={processing}>Apply dates</Button>
                    </FormFeedback>
                )}
            </Form>
        </aside>
    );
}
