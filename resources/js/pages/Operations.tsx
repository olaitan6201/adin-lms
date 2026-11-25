import { Form, Head, Link } from '@inertiajs/react';
import InfrastructurePanel, { type Infrastructure } from '../components/InfrastructurePanel';

type Status = {
    activeSessions: number;
    failedDeliveries: number;
    failedLogins: number;
    retentionDays: number | null;
    infrastructure: Infrastructure;
};

export default function Operations({ activeSessions, failedDeliveries, failedLogins, retentionDays, infrastructure }: Status) {
    return (
        <main className="mx-auto max-w-2xl space-y-6 px-6 py-12">
            <Head title="Institution operations" />
            <h1 className="text-3xl font-semibold">Institution operations</h1>
            <dl>
                <dt>Unexpired, unrevoked sessions</dt>
                <dd>{activeSessions}</dd>
                <dt>Failed notification deliveries</dt>
                <dd>{failedDeliveries}</dd>
                <dt>Failed password or MFA checks in the last 24 hours</dt>
                <dd>{failedLogins}</dd>
            </dl>
            <InfrastructurePanel data={infrastructure} />
            <h2 className="text-xl font-semibold">Withdrawn feedback consent</h2>
            <p>
                {retentionDays === null
                    ? 'Deletion is disabled until a retention period is configured.'
                    : `Eligible for approved deletion after ${retentionDays} days.`}
            </p>
            <Form action="/operations/retention" method="post">
                {({ errors, processing, recentlySuccessful }) => (
                    <>
                        <label>
                            Retention period (days)
                            <input
                                className="block border p-2"
                                type="number"
                                name="days"
                                defaultValue={retentionDays ?? ''}
                                min={1}
                                max={3650}
                                required
                            />
                        </label>
                        {errors.days && <p role="alert">{errors.days}</p>}
                        <button className="my-2 bg-teal-900 p-2 text-white" disabled={processing}>
                            Save retention period
                        </button>
                        {recentlySuccessful && <p role="status">Retention period saved.</p>}
                    </>
                )}
            </Form>
            <Link className="underline" href="/courses">
                My courses
            </Link>
        </main>
    );
}
