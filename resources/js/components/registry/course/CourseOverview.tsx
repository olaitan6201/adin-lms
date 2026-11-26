import { status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { Overview } from '@/types/registry/course';

export function CourseOverview({
    overview,
    draft,
    edit,
}: {
    overview: Overview;
    draft: boolean;
    edit: () => void;
}) {
    return (
        <Card
            title="Course overview"
            subtitle="The text a student reads before registering"
            actions={
                <>
                    {status(draft ? 'Draft' : 'Published')}
                    <Action icon="edit" size="sm" onClick={edit}>
                        Edit overview
                    </Action>
                </>
            }
        >
            <div className="space-y-5">
                {[
                    ['Purpose', overview.purpose],
                    ['Course outline', overview.outline],
                ].map(([label, value]) => (
                    <section key={label}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                            {label}
                        </p>
                        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-700">{value}</p>
                    </section>
                ))}
                <div className="grid gap-4 lg:grid-cols-2">
                    {[
                        ['Entry requirement', overview.entry],
                        ['Delivery mode', overview.delivery],
                    ].map(([label, value]) => (
                        <Card key={label} title={label}>
                            <p className="text-[13px] leading-relaxed text-ink-700">{value}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </Card>
    );
}
