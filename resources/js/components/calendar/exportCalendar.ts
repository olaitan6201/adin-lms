import { download } from '@/lib/download';
import type { CalendarEvent } from '@/types/calendar/calendar';

function escapeText(value: string) {
    return value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replace(/[\r\n]+/g, '\\n');
}

function utcStamp(date: Date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function eventRecord(event: CalendarEvent) {
    const startsAt = new Date(`${event.date}T${event.time}:00+01:00`);
    return [
        'BEGIN:VEVENT',
        `UID:${event.id}@adin-lms`,
        `DTSTAMP:${utcStamp(new Date())}`,
        `DTSTART:${utcStamp(startsAt)}`,
        `SUMMARY:${escapeText(event.title)}`,
        `DESCRIPTION:${escapeText(event.course)}`,
        'END:VEVENT',
    ];
}

export function exportCalendar(events: CalendarEvent[]) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Adin LMS//Calendar//EN', ...events.flatMap(eventRecord), 'END:VCALENDAR', ''];
    download('academic-calendar.ics', lines.join('\r\n'), 'text/calendar');
}
