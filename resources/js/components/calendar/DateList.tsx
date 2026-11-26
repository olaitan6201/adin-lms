import { Link } from '@inertiajs/react';
import { LearnerTime } from '@/components/calendar/LearnerTime';
import { localDate, type AgendaDate } from './dates';

export function DateList({ events, empty }: {
    events: AgendaDate[];
    empty: string;
}) {
    if (!events.length) return <p className="text-sm text-ink-600">{empty}</p>;

    return (
        <ul className="divide-y divide-ink-100">
            {events.map((event, index) => {
                const day = localDate(event.at);
                return (
                    <li key={`${event.at}:${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <span
                            aria-hidden="true"
                            className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-ink-50 text-ink-700"
                        >
                            <strong className="text-sm leading-none tabular-nums">{day.getDate()}</strong>
                            <span className="text-[10px] uppercase">
                                {day.toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                        </span>
                        <div className="min-w-0 wrap-anywhere text-sm">
                            {event.href ? (
                                <Link className="font-semibold text-brand-800 hover:underline" href={event.href}>
                                    {event.title}
                                </Link>
                            ) : (
                                <p className="font-semibold">{event.title}</p>
                            )}
                            <p className="text-xs text-ink-600">
                                {event.context} · {event.kind}
                            </p>
                            {event.at.length > 10 ? (
                                <LearnerTime instant={event.at} className="text-xs text-ink-600" />
                            ) : (
                                <time dateTime={event.at} className="text-xs text-ink-600">
                                    {day.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </time>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
