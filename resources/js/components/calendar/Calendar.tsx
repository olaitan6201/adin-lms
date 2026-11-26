import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import type { CalendarEvent as Entry, ScheduleData } from '@/types/calendar/calendar';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { type TeachingRole } from '@/types/identity/roles';
import { calendarMonth, monthOffset } from './calendarMonth';
import { EventEditor, type EventDraft } from './EventEditor';
import { exportCalendar } from './exportCalendar';
import { WorkspaceMonthGrid } from './WorkspaceMonthGrid';

export function Calendar({ role, data }: { data: ScheduleData; role: TeachingRole }) {
    const { today, term, events: calendarEvents, kinds: calendarKinds, milestones } = data;
    const [offset, setOffset] = useState(0);
    const [filter, setFilter] = useState('All');
    const [events, setEvents] = useState(calendarEvents);
    const [selected, setSelected] = useState<Entry | 'new' | null>(null);
    const { title: month, days, firstDate } = calendarMonth(today, offset);
    const visibleEvents = filter === 'All' ? events : events.filter((event) => event.kind === filter);

    function addEvent(draft: EventDraft) {
        const event = { ...draft, id: crypto.randomUUID(), owner: 'You' };
        setEvents((current) => [...current, event]);
        setOffset(monthOffset(today, draft.date));
        setFilter('All');
        setSelected(null);
    }

    const add = (
        <Action icon="plus" variant="primary" onClick={() => setSelected('new')}>
            Add event
        </Action>
    );
    const upcoming = events
        .filter((e) => e.date >= today)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 8);
    return (
        <div className="engagement-workspace engagement-calendar space-y-5">
            <PageHeader
                eyebrow="Schedule"
                title="Calendar"
                description={`Teaching sessions, examinations, deadlines and institutional dates ${role === 'student' ? 'that apply to your registrations' : 'across the institution'}.`}
                actions={
                    <>
                        <Action icon="download" onClick={() => exportCalendar(events)}>
                            Export calendar
                        </Action>
                        {add}
                    </>
                }
            />
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Card
                    title={month}
                    subtitle={`${term} - dates published by the Registrar and the Examinations Office`}
                    bodyClassName="p-0"
                    actions={
                        <>
                            <Action icon="calendar" size="sm" onClick={() => setOffset(0)}>
                                Today
                            </Action>
                            <Action icon="plus" size="sm" variant="primary" onClick={() => setSelected('new')}>
                                Add event
                            </Action>
                        </>
                    }
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
                        <div className="flex items-center gap-2">
                            <button className="btn btn-ghost btn-sm" aria-label="Previous month" onClick={() => setOffset(offset - 1)}>
                                <Icon name="chevronLeft" className="size-4" />
                            </button>
                            <span className="text-[13px] font-semibold">{month}</span>
                            <button className="btn btn-ghost btn-sm" aria-label="Next month" onClick={() => setOffset(offset + 1)}>
                                <Icon name="chevronRight" className="size-4" />
                            </button>
                        </div>
                        <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-lg bg-ink-100 p-0.5">
                            {['All', 'Examination', 'Deadline', 'Teaching'].map((kind) => (
                                <button
                                    key={kind}
                                    aria-pressed={filter === kind}
                                    onClick={() => setFilter(kind)}
                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${filter === kind ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}
                                >
                                    {kind === 'Deadline' || kind === 'Examination' ? `${kind}s` : kind}
                                </button>
                            ))}
                        </div>
                    </div>
                    <WorkspaceMonthGrid today={today} days={days} events={visibleEvents} onSelect={setSelected} />
                </Card>
                <div className="min-w-0 space-y-5">
                    <Card title="Upcoming dates" subtitle="From today onwards, in date order" bodyClassName="p-0">
                        {upcoming.map((e) => (
                            <button
                                key={e.id}
                                onClick={() => setSelected(e)}
                                className="flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-ink-50/70"
                            >
                                <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-ink-50 text-ink-600">
                                    <span className="text-[9.5px] leading-none font-semibold">{e.date.slice(-2)}</span>
                                    <span className="mt-0.5 font-mono text-[10px] leading-none">{e.date.slice(5, 7)}</span>
                                </span>
                                <span className="min-w-0 flex-1">
                                    <strong className="block truncate text-[13.5px] font-medium">{e.title}</strong>
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
                                        <span className={`size-1.5 shrink-0 rounded-full ${passed ? 'bg-ink-300' : 'bg-brand-500'}`} />
                                        <span className="truncate text-[13px] text-ink-700">{name}</span>
                                    </span>
                                    <small className="shrink-0 text-[12.5px] font-medium">{date}</small>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
            {selected && (
                <Drawer title={selected === 'new' ? 'Add event' : selected.title} close={() => setSelected(null)}>
                    {selected === 'new' ? (
                        <EventEditor
                            defaultDate={offset === 0 ? today : firstDate}
                            defaultTime={data.defaultTime}
                            defaultCourse={data.defaultCourse}
                            kinds={calendarKinds}
                            onSave={addEvent}
                        />
                    ) : (
                        <>
                            <Badge>{selected.kind}</Badge>
                            <p>
                                {selected.date} · {selected.time}
                            </p>
                            <p>
                                {selected.course} · {selected.owner}
                            </p>
                        </>
                    )}
                </Drawer>
            )}
        </div>
    );
}
