import type { CalendarEvent } from '@/types/calendar/calendar';
import type { calendarMonth } from './calendarMonth';

const colors: Record<string, string> = {
    Institution: 'bg-brand-50 text-brand-800',
    Examination: 'bg-rose-50 text-rose-800',
    Deadline: 'bg-amber-50 text-amber-800',
    Teaching: 'bg-sky-50 text-sky-800',
    'Live class': 'bg-sky-50 text-sky-800',
};

type GridProps = {
    today: string;
    days: ReturnType<typeof calendarMonth>['days'];
    events: CalendarEvent[];
    onSelect: (event: CalendarEvent) => void;
};

export function WorkspaceMonthGrid({ today, days, events, onSelect }: GridProps) {
    return <>
        <div className="grid grid-cols-7 border-b bg-ink-50/60">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <span key={day} className="px-2 py-2 text-[10.5px] font-semibold tracking-wide uppercase text-ink-400">{day}</span>
            ))}
        </div>
        <div className="grid grid-cols-7 border-l">
            {days.map(({ iso, day, inMonth }) => {
                const isToday = iso === today;
                return (
                    <div key={iso} className={`min-h-[74px] min-w-0 border-b border-r p-1.5 ${inMonth ? 'text-ink-700' : 'bg-ink-50/60 text-ink-300'}`}>
                        <div className="flex items-center justify-between">
                            <span
                                aria-current={isToday ? 'date' : undefined}
                                className={`text-[11.5px] font-semibold tnum ${isToday ? 'flex size-5 items-center justify-center rounded-full bg-brand-600 text-white' : ''}`}
                            >
                                {day}
                            </span>
                            {isToday && <small className="text-[9.5px] font-semibold tracking-wide text-brand-700 uppercase">Today</small>}
                        </div>
                        {events.filter(event => event.date === iso).map(event => (
                            <button
                                key={event.id}
                                title={event.title}
                                onClick={() => onSelect(event)}
                                className={`mt-1 block w-full truncate rounded px-1.5 py-0.5 text-left text-[10.5px] font-medium ${colors[event.kind] ?? 'bg-ink-100 text-ink-700'}`}
                            >
                                {event.time} {event.title}
                            </button>
                        ))}
                    </div>
                );
            })}
        </div>
    </>;
}
