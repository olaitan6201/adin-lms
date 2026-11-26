import { Card } from '@/components/ui/layout/Card';
import { StudyIcon } from '@/components/learning/Parts';

export function ResultPolicy({ policy }: { policy: string[] }) {
    return (
        <Card title="How these numbers were produced" subtitle="The policy behind your score sheet">
            <>
                <ul className="space-y-2.5">
                    {policy.map((rule) => (
                        <li key={rule} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-600">
                            <span className="mt-0.5 shrink-0 text-brand-600">
                                <StudyIcon name="check" className="w-4 h-4" />
                            </span>
                            {rule}
                        </li>
                    ))}
                </ul>
                <div className="mt-4 rounded-xl bg-ink-50 p-3.5">
                    <p className="text-[12px] font-semibold text-ink-700">Query a result</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">
                        If a score looks wrong, message the examination officer through Communication. Queries are recorded against the
                        result.
                    </p>
                </div>
            </>
        </Card>
    );
}
