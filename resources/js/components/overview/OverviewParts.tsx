import { useEffect, useState, type ReactNode } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { StatTile } from '@/components/ui/data-display/StatTile';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Sparkline } from './Charts';

type Tile = { label: string; value: string; delta?: string; deltaLabel: string; icon: string; spark?: Parameters<typeof Sparkline>[0] };

export function Tiles({ items }: { items: readonly Tile[] }) {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ spark, ...tile }) => <StatTile key={tile.label} {...tile}>{spark && <Sparkline {...spark}/>}</StatTile>)}
    </div>;
}

export function Columns({ left, right, seven = false }: { left: ReactNode; right: ReactNode; seven?: boolean }) {
    return <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className={seven ? 'min-w-0 xl:col-span-7' : 'min-w-0 xl:col-span-8'}>{left}</div>
        <div className={seven ? 'min-w-0 xl:col-span-5' : 'min-w-0 xl:col-span-4'}>{right}</div>
    </div>;
}

export function Note({ children }: { children: ReactNode }) {
    return <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-3 text-[13px] leading-relaxed text-sky-900">
        <Icon name="info" className="mt-0.5 size-4 shrink-0"/>{children}
    </div>;
}

export function useFeedback() {
    const [notice, setNotice] = useState<{ text: string }>();
    useEffect(() => {
        if (!notice) return;
        const id = window.setTimeout(() => setNotice(undefined), 3800);
        return () => window.clearTimeout(id);
    }, [notice]);
    const feedback = <div role="status" className="fixed bottom-5 right-5 z-50">
        {notice && <div className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-[13px] text-brand-900 shadow-lift">
            <Icon name="check" className="mt-0.5 size-4 shrink-0"/>{notice.text}</div>}
    </div>;
    return { notify: (text: string) => setNotice({ text }), feedback };
}

export function RecordName({ title, code }: { title: string; code: string }) {
    return <div className="min-w-0"><p className="truncate font-medium text-ink-800">{title}</p>
        <p className="truncate font-mono text-[11px] text-ink-400">{code}</p></div>;
}

export function CourseProgress({ value }: { value: number }) {
    return <div className="flex items-center gap-2"><div className="prog-track"><div className="prog-fill" style={{ width: `${value}%` }}/></div>
        <span className="text-[11px] font-medium text-ink-600 tnum">{value}%</span></div>;
}

export function Go({ to, children, icon, primary }: { to: string; children: ReactNode; icon?: string; primary?: boolean }) {
    return <Action href={workspaceUrl(to)} size="sm" icon={icon} variant={primary ? 'primary' : icon ? 'ghost' : 'outline'}>{children}</Action>;
}

type Event = { when: string; title: string; meta: string };
export function ComingUp({ events, student = false }: { events: readonly Event[]; student?: boolean }) {
    return <Card title="Coming up" subtitle={student ? 'Deadlines and sessions in the next two weeks' : 'Live classes and examinations in the next seven days'}
        actions={!student && <Go to="lecturer/calendar" icon="calendar">Calendar</Go>}>
        <ol className="relative space-y-4 border-l border-ink-100 pl-5">{events.map((e, i) => <li className="relative" key={e.when}>
            <span className={`absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-white ${student && !i ? 'bg-rose-500' : 'bg-brand-500'}`}/>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${student && !i ? 'text-rose-600' : 'text-brand-700'}`}>{e.when}</p>
            <p className="mt-1 text-[13.5px] font-medium text-ink-800">{e.title}</p>
            <p className="mt-0.5 text-xs text-ink-500">{e.meta}</p>
        </li>)}</ol>
    </Card>;
}
