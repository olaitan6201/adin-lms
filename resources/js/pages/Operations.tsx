import { Head, Link } from '@inertiajs/react';
import InfrastructurePanel, { type Infrastructure } from '../components/InfrastructurePanel';
import BrandingPanel from '../components/BrandingPanel';
import RetentionPolicy from '../components/RetentionPolicy';

type Status = {
    activeSessions: number;
    failedDeliveries: number;
    failedLogins: number;
    retentionDays: number | null;
    infrastructure: Infrastructure;
};

export default function Operations({
    activeSessions,
    failedDeliveries,
    failedLogins,
    retentionDays,
    infrastructure,
}: Status) {
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
            <BrandingPanel />
            <RetentionPolicy days={retentionDays} />
            <Link className="underline" href="/courses">
                My courses
            </Link>
        </main>
    );
}
