import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
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
    return <section aria-labelledby="agenda-heading" className="min-w-0"><Card>
        <CardHeader>
            <h2 id="agenda-heading" className="text-xl font-semibold">{title}</h2>
            <CardDescription>{hint}</CardDescription>
        </CardHeader>
        <CardContent>
            {items.length ? <ol className="divide-y">{items.map((item, index) => (
                <li key={`${item.href}:${index}`} className="grid min-w-0 items-center gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="space-y-1 wrap-anywhere">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Badge variant="secondary">{item.kind}</Badge><span>{item.context}</span>
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.at && <LearnerTime className="text-sm text-muted-foreground" instant={item.at} />}
                    </div>
                    <Button asChild variant="outline" className="w-fit"><Link href={item.href}>{item.action}</Link></Button>
                </li>
            ))}</ol> : <p>{empty}</p>}
        </CardContent>
    </Card></section>;
}
