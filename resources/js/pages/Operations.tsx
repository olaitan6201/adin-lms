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
        <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
            <Head title="Institution operations" />
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">System administration</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Institution operations</h1>
                <nav aria-label="Operations sections" className="flex flex-wrap gap-x-5 gap-y-2">
                    <a className="text-primary underline underline-offset-4" href="#monitor-settings">Monitoring settings</a>
                    <a className="text-primary underline underline-offset-4" href="#branding-heading">Institution identity</a>
                    <a className="text-primary underline underline-offset-4" href="#retention">Retention policy</a>
                </nav>
            </header>
            <dl className="grid gap-4 border-y border-border py-4 sm:grid-cols-3">
                <div><dt>Unexpired, unrevoked sessions</dt><dd className="text-xl font-semibold">{activeSessions}</dd></div>
                <div><dt>Failed notification deliveries</dt><dd className="text-xl font-semibold">{failedDeliveries}</dd>
                    {failedDeliveries > 0 && <dd><Link className="text-primary underline" href="/community/delivery-failures">Review failed deliveries</Link></dd>}</div>
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
