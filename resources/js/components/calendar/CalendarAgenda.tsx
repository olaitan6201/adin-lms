import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import type { CalendarEvent, ScheduleData } from '@/types/calendar/calendar';

type Props = {
    upcoming: CalendarEvent[];
    calendarKinds: ScheduleData['kinds'];
    milestones: ScheduleData['milestones'];
    onSelect: (event: CalendarEvent) => void;
};
export function CalendarAgenda({ upcoming, calendarKinds, milestones, onSelect }: Props) {
    return (
        <div className="min-w-0 space-y-5">
            <Card title="Upcoming dates" subtitle="All times in West Africa Time (UTC+01:00)" bodyClassName="p-0">
                {upcoming.map((e) => (
                    <button
                        key={e.id}
                        onClick={() => onSelect(e)}
                        className="flex w-full items-start gap-3 border-b border-ink-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-ink-50/70"
                    >
                        <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-ink-50 text-ink-600">
                            <span className="text-[9.5px] leading-none font-semibold">{e.date.slice(-2)}</span>
                            <span className="mt-0.5 font-mono text-[10px] leading-none">{e.date.slice(5, 7)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                            <strong className="block truncate text-[13.5px] font-medium text-ink-800">{e.title}</strong>
                            <small className="mt-0.5 block truncate text-[12px] text-ink-500">
                                {e.time} · {e.course} · {e.owner}
                            </small>
                        </span>
                        <Badge tone={calendarKinds.find((k) => k.kind === e.kind)?.tone}>{e.kind}</Badge>
                    </button>
                ))}
            </Card>
            <Card title="Key institutional dates" subtitle="Fixed by the academic calendar and published to every role">
                <ul className="space-y-2.5">
                    {milestones.map(({ label: name, date, passed }) => (
                        <li key={name} className="flex items-center justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-2">
                                <span
                                    className={`size-1.5 shrink-0 rounded-full ${passed ? 'bg-ink-300' : 'bg-brand-500'}`}
                                />
                                <span className="truncate text-[13px] text-ink-700">{name}</span>
                            </span>
                            <small className="shrink-0 text-[12.5px] font-medium">{date}</small>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
