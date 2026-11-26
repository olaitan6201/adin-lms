import { Card } from '@/components/ui/layout/Card';
import { status } from './Records';

export function PlatformFeatures({ features }: { features: string[][] }) {
    return (
        <Card
            title="Progressive web app"
            subtitle="The decided mobile strategy for the platform"
            actions={
                <>
                    {status('Installable', 'emerald')}
                    {status('Offline shell', 'sky')}
                </>
            }
        >
            <div className="grid gap-3 lg:grid-cols-2">
                {features.map(([label, text]) => (
                    <div key={label} className="rounded-xl border border-ink-100 p-3.5">
                        <p className="text-[13px] font-semibold">{label}</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{text}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-amber-900">
                <p className="text-[13px] font-semibold">What the PWA route does not settle</p>
                <ul className="mt-1.5 space-y-1 text-[12.5px] leading-relaxed">
                    <li>A store-published native build is a separate procurement decision and is not implied here.</li>
                    <li>Push delivery needs a push service and is not implemented by this prototype.</li>
                    <li>
                        Offline access caches the shell and the resources a student has already downloaded; it is not a
                        low bandwidth mode.
                    </li>
                </ul>
            </div>
        </Card>
    );
}
