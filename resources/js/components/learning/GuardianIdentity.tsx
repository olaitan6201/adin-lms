import type { Guardian } from '@/types/learning/study';
import { StudyIcon } from './Parts';
import { Timeline } from '@/components/learning/Parts';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';

export function GuardianIdentity({ guardian }: { guardian: Guardian }) {
    return (
        <Card title="Student you are linked to" subtitle="Linking is by the Registrar, never by the guardian">
            <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                            {guardian.initials}
                        </span>
                        <div>
                            <p className="text-[15px] font-semibold text-ink-900">{guardian.student.name}</p>
                            <p className="mt-0.5 font-mono text-[12px] text-ink-500">{guardian.student.matric}</p>
                            <p className="mt-1 text-[12.5px] text-ink-600">
                                {guardian.student.programme} · {`Level ${guardian.student.level}`}
                            </p>
                        </div>
                    </div>
                    <Badge tone="emerald">{guardian.consentState}</Badge>
                </div>
                <div className="mt-4 border-t border-ink-100 pt-3">
                    <Timeline items={guardian.timeline} />
                </div>
            </>
        </Card>
    );
}

export function Withheld({ items }: { items: string[] }) {
    return (
        <Card title="Not visible to a guardian" subtitle="Stated here so that the boundary is not a matter of trust">
            <ul className="space-y-2.5">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                            <StudyIcon name="close" className="w-3 h-3" />
                        </span>
                        <span className="text-[13px] leading-relaxed text-ink-700">{item}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
