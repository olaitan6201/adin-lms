import { Details } from '@/components/registry/Records';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';

export function StructureHealth({
    structureChecks,
    healthScope,
}: {
    structureChecks: { result: string; title: string; detail: string }[];
    healthScope: [string, string][];
}) {
    return (
        <Card title="Structure health" subtitle="Checks run on the current structure">
            <div className="space-y-3">
                {structureChecks.map((check) => (
                    <div
                        key={check.result}
                        className={`flex items-start gap-2.5 rounded-xl border p-3 ${check.result === 'pass' ? 'border-brand-200 bg-brand-50/60 text-brand-900' : 'border-amber-200 bg-amber-50/60 text-amber-900'}`}
                    >
                        <Icon
                            name={check.result === 'pass' ? 'check' : 'alert'}
                            className={`mt-0.5 size-4 shrink-0 ${check.result === 'pass' ? 'text-brand-700' : 'text-amber-700'}`}
                        />
                        <div>
                            <p className="text-[13px] font-semibold">{check.title}</p>
                            <p
                                className={`mt-0.5 text-xs ${check.result === 'pass' ? 'text-brand-800/80' : 'text-amber-800/80'}`}
                            >
                                {check.detail}
                            </p>
                        </div>
                    </div>
                ))}
                <div className="rounded-xl border border-ink-100 p-3.5 [&_dt]:text-ink-500">
                    <Details entries={healthScope} />
                </div>
            </div>
        </Card>
    );
}
