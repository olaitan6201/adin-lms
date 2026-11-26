import { download } from '@/lib/download';
import type { CalendarEvent } from '@/types/calendar/calendar';

function escapeText(value: string) {
    return value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replace(/[\r\n]+/g, '\\n');
}

function eventRecord(event: CalendarEvent) {
    return [
        'BEGIN:VEVENT',
        `UID:${event.id}@adin-lms`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        `DTSTART:${event.date.replaceAll('-', '')}T${event.time.replace(':', '')}00`,
        `SUMMARY:${escapeText(event.title)}`,
        `DESCRIPTION:${escapeText(event.course)}`,
        'END:VEVENT',
    ];
}

export function exportCalendar(events: CalendarEvent[]) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Adin LMS//Calendar//EN', ...events.flatMap(eventRecord), 'END:VCALENDAR', ''];
    download('academic-calendar.ics', lines.join('\r\n'), 'text/calendar');
}
