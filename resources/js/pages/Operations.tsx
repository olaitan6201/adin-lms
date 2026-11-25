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
        <main className="portal-page space-y-6">
            <Head title="Institution operations" />
            <header className="desk-heading">
                <p className="portal-kicker">System administration</p>
                <h1 className="portal-title">Institution operations</h1>
                <nav aria-label="Operations sections" className="flex flex-wrap gap-x-5 gap-y-2">
                    <a className="desk-link" href="#monitor-settings">Monitoring settings</a>
                    <a className="desk-link" href="#branding-heading">Institution identity</a>
                    <a className="desk-link" href="#retention">Retention policy</a>
                </nav>
            </header>
            <dl className="grid gap-4 border-y border-[var(--portal-line)] py-4 sm:grid-cols-3">
                <div><dt>Unexpired, unrevoked sessions</dt><dd className="text-xl font-semibold">{activeSessions}</dd></div>
                <div><dt>Failed notification deliveries</dt><dd className="text-xl font-semibold">{failedDeliveries}</dd></div>
                <div><dt>Failed password or MFA checks in the last 24 hours</dt><dd className="text-xl font-semibold">{failedLogins}</dd></div>
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
