import type { ScheduleData } from '@/types/calendar/calendar';
import { academicCalendar, calendarEvents, calendarKinds } from './academicCalendar';

export const schedule: ScheduleData = {
    today: academicCalendar.today, term: academicCalendar.term, events: calendarEvents, kinds: calendarKinds,
    milestones: [
        { label: 'Repository freeze for the semester', date: '05 Nov 2026', passed: true },
        { label: 'Mid-term examination window', date: '07 to 13 Nov 2026', passed: true },
        { label: 'Mid-term results release', date: '01 Dec 2026', passed: false },
        { label: 'Practical examination window opens', date: '08 Dec 2026', passed: false },
        { label: 'End of first semester teaching', date: '19 Dec 2026', passed: false },
    ],
    defaultTime: '09:00', defaultCourse: 'Personal calendar',
};
