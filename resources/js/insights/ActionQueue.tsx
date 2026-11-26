import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { InsightPanel } from './InsightPanel';
import { Badge } from '@/components/ui/badge';
import { LearnerTime } from '../components/LearnerTime';

export type AgendaItem = {
    title: string;
    kind: string;
    context: string;
    at: string | null;
    href: string;
    action: string;
};

export function ActionQueue({ items, title, hint, empty }: {
    items: AgendaItem[]; title: string; hint: string; empty: string;
}) {
    return <InsightPanel title={title} subtitle={hint}>
            {items.length ? <ol className="@container ml-1 space-y-4 border-l border-ink-200 pl-5">{items.map((item, index) => (
                <li key={`${item.href}:${index}`} className="relative grid min-w-0 items-center gap-2 @md:grid-cols-[minmax(0,1fr)_auto]">
                    <span aria-hidden="true" className="absolute -left-[25px] top-2 size-2 rounded-full bg-brand-600 ring-2 ring-white" />
                    <div className="space-y-1 wrap-anywhere">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Badge variant="secondary">{item.kind}</Badge><span>{item.context}</span>
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.at && <LearnerTime className="text-sm text-muted-foreground" instant={item.at} />}
                    </div>
                    <Button asChild variant="outline" className="w-fit"><Link href={item.href}>{item.action}</Link></Button>
                </li>
            ))}</ol> : <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-600">{empty}</p>}
    </InsightPanel>;
}
