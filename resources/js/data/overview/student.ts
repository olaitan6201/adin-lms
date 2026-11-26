import { studentAssignments } from '@/data/assessments/studentAssignments';
import { submissionWindow } from '@/lib/submissionWindow';
export { studentResults } from '@/data/learning/courseWorkspace';

export const notifications = [
  { id: 'n-1', title: 'Mid-term examination timetable published', meta: 'ACC302 - 18 Nov 2026, 09:00', tone: 'sky', time: '18 min ago' },
] as const;

export const pending = studentAssignments.work
    .filter(({ assignment, current }) => submissionWindow(assignment, studentAssignments.sampleTime) === 'Open' && !current)
    .map(({ assignment }) => ({
        id: assignment.id,
        title: assignment.title,
        course: assignment.course,
        due: assignment.due,
        state: 'Not submitted',
        tone: 'amber',
    }));

export const tiles = [
      { label: 'Registered courses', value: '4', deltaLabel: '12 units', icon: 'book' },
      { label: 'Lessons completed', value: '16', delta: '+4', deltaLabel: 'this week', icon: 'check' },
      { label: 'Assignments pending', value: String(pending.length), deltaLabel: 'awaiting submission', icon: 'clipboard' },
      { label: 'Attendance', value: '92%', delta: '+3%', deltaLabel: 'vs last semester', icon: 'calendarCheck' }
    ] as const;

export const schedule = [
    { when: 'Today, 16:00', title: 'Tutorial: consolidation of accounts', meta: 'ACC302 · live class' },
    { when: '14 Nov, 23:59', title: 'Journal entry and trial balance problem set', meta: 'ACC302 · assignment due' },
    { when: '18 Nov, 09:00', title: 'ACC302 mid-term examination', meta: '90 minutes · access opens 08:45' },
    { when: '21 Nov, 13:00', title: 'BSC205 mid-term examination', meta: '60 minutes' }
  ] as const;
