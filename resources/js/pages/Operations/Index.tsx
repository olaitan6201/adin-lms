import { Head, Link } from '@inertiajs/react';
import InfrastructurePanel, {
    type Infrastructure,
} from '@/components/operations/infrastructure/InfrastructurePanel';
import BrandingPanel from '@/components/operations/BrandingPanel';
import RetentionPolicy from '@/components/operations/privacy/RetentionPolicy';
import { DeskHeading } from '@/components/academics/DeskHeading';

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
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Institution operations" />
            <DeskHeading
                area="System administration"
                title="Institution operations"
            >
                System health, monitoring settings and institutional data retention.
            </DeskHeading>
            <nav
                aria-label="Operations sections"
                className="card flex flex-wrap gap-x-5 gap-y-2 px-5 py-3"
            >
                <a
                    className="text-primary underline underline-offset-4"
                    href="#monitor-settings"
                >
                    Monitoring settings
                </a>
                <a
                    className="text-primary underline underline-offset-4"
                    href="#branding-heading"
                >
                    Institution identity
                </a>
                <a
                    className="text-primary underline underline-offset-4"
                    href="#retention"
                >
                    Retention policy
                </a>
            </nav>
            <dl className="grid gap-4 sm:grid-cols-3">
                <div className="kpi">
                    <dt className="kpi-label">Unexpired, unrevoked sessions</dt>
                    <dd className="kpi-value">{activeSessions}</dd>
                </div>
                <div className="kpi">
                    <dt className="kpi-label">Failed notification deliveries</dt>
                    <dd className="kpi-value">{failedDeliveries}</dd>
                    {failedDeliveries > 0 && (
                        <dd>
                            <Link
                                className="text-primary underline"
                                href="/community/delivery-failures"
                            >
                                Review failed deliveries
                            </Link>
                        </dd>
                    )}
                </div>
                <div className="kpi">
                    <dt className="kpi-label">Failed password or MFA checks in the last 24 hours</dt>
                    <dd className="kpi-value">{failedLogins}</dd>
                </div>
            </dl>
            <InfrastructurePanel data={infrastructure} />
            <div className="grid items-start gap-5 lg:grid-cols-2">
                <BrandingPanel />
                <RetentionPolicy days={retentionDays} />
            </div>
            <Link
                className="underline"
                href="/courses"
            >
                My courses
            </Link>
        </main>
    );
}
