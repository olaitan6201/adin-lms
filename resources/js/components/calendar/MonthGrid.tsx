import { Link } from '@inertiajs/react';
import { localDate, eventGroup, tones, type AgendaDate } from './dates';

export function MonthGrid({ month, events, today }: { month: Date; events: AgendaDate[]; today: Date }) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = Array.from({ length: 42 }, (_, index) =>
        new Date(month.getFullYear(), month.getMonth(), index - first.getDay() + 1));
    return <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} calendar</caption>
        <thead className="bg-ink-50"><tr>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(label =>
            <th key={label} scope="col" className="border-b border-ink-100 px-1 py-2 text-center text-[10px] font-semibold uppercase text-ink-600 sm:px-2 sm:text-left">{label}</th>
        )}</tr></thead>
        <tbody>{Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>{days.slice(week * 7, week * 7 + 7).map(day => {
                const inMonth = day.getMonth() === month.getMonth();
                const current = day.toDateString() === today.toDateString();
                const items = inMonth ? events.filter(item => localDate(item.at).toDateString() === day.toDateString()) : [];
                return <td key={day.getTime()} className={`h-16 border border-ink-100 p-1 align-top sm:h-20 sm:p-1.5 ${inMonth ? '' : 'bg-ink-50/70'}`}>
                    <span aria-current={current ? 'date' : undefined} className={`inline-grid size-5 place-items-center rounded-full text-xs font-semibold tabular-nums ${current ? 'bg-brand-700 text-white' : 'text-ink-600'}`}>
                        {day.getDate()}
                    </span>
                    {items.length > 0 && <span className="mt-1 block text-center text-xs font-semibold text-brand-800 sm:hidden">
                        {items.length}<span className="sr-only"> calendar entries</span>
                    </span>}
                    {items.map((item, index) => {
                        const title = `${item.kind}: ${item.title} · ${item.context}`;
                        const style = `mt-1 hidden truncate rounded px-1 py-0.5 text-[11px] font-medium sm:block ${tones[eventGroup(item)]}`;
                        return item.href
                            ? <Link key={index} aria-label={title} title={title} href={item.href} className={style}>{item.title}</Link>
                            : <span key={index} title={title} className={style}>{item.title}</span>;
                    })}
                </td>;
            })}</tr>
        ))}</tbody>
    </table>;
}
