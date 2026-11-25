import { Button } from '@/components/ui/button';
import { Form } from '@inertiajs/react';
import { OperationsInput, CorrectionFocus } from './OperationsFields';

export default function RetentionPolicy({ days: retentionDays }: { days: number | null }) {
    return (
        <section className="portal-panel desk-shelf space-y-3" aria-label="Retention policy">
            <h2 className="desk-section">Withdrawn feedback consent</h2>
            <p>
                {retentionDays === null
                    ? 'Deletion is disabled until a retention period is configured.'
                    : `Eligible for approved deletion after ${retentionDays} days.`}
            </p>
            <p>Saving changes when withdrawn consents qualify for deletion. Deletion requires a separate approved action.</p>
            <Form id="retention" action="/operations/retention" method="post">
                {({ errors, processing, recentlySuccessful }) => (
                    <>
                        <CorrectionFocus errors={errors} />
                        <OperationsInput label="Retention period (days)" error={errors.days}
                            type="number"
                            name="days"
                            defaultValue={retentionDays ?? ''}
                            min={1}
                            max={3650}
                            required
                        />
                        <Button className="my-2" disabled={processing}>
                            Save retention period
                        </Button>
                        {recentlySuccessful && <p role="status">Retention period saved.</p>}
                    </>
                )}
            </Form>
        </section>
    );
}
