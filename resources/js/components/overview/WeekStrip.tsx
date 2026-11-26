import { type AgendaItem } from './ActionQueue';

type WeekStripProps = {
    queue: AgendaItem[];
    today: Date;
};

export function WeekStrip({ queue, today }: WeekStripProps) {
    const start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return (
        <ol
            aria-label="This week, Monday through Sunday"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
        >
            {Array.from({ length: 7 }, (_, index) => {
                const date = new Date(start);
                date.setDate(start.getDate() + index);
                const current = date.toDateString() === today.toDateString();
                const items = queue.filter(
                    (task) => task.at && new Date(task.at).toDateString() === date.toDateString(),
                );
                return (
                    <li
                        key={index}
                        aria-current={current ? 'date' : undefined}
                        className={`flex flex-col gap-1 rounded-xl border p-3 ${current ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-ink-100 bg-ink-50 text-ink-600'}`}
                    >
                        <span className="text-xs font-medium uppercase">
                            {date.toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                        <strong className="text-xl tabular-nums">{date.getDate()}</strong>
                        <small>
                            {current ? 'Today' : ''}
                            {current && items.length ? ' · ' : ''}
                            {items.length ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : ''}
                        </small>
                    </li>
                );
            })}
        </ol>
    );
}
