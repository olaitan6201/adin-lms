import type { ShellNotice } from '@/types/navigation/shell';

export const notices: readonly ShellNotice[] = [
    {
        id: 'n-1', title: 'Mid-term examination timetable published',
        meta: 'ACC302 - 18 Nov 2026, 09:00', time: '18 min ago', tone: 'info', needsAttention: false,
    },
    {
        id: 'n-2', title: '34 submissions awaiting marking',
        meta: 'Journal entry and trial balance problem set', time: '2 h ago', tone: 'warning', needsAttention: true,
    },
    {
        id: 'n-3', title: 'Course structure copied from 2024/2025',
        meta: 'ENG210 - no grades or registrations copied', time: 'Yesterday', tone: 'success', needsAttention: false,
    },
    {
        id: 'n-4', title: 'Backup completed',
        meta: 'Nightly 02:00 job, 41.2 GB written', time: 'Yesterday', tone: 'success', needsAttention: false,
    },
    {
        id: 'n-5', title: 'MFA enrolment required for exam officers',
        meta: 'Policy effective 01 Dec 2026', time: '2 days ago', tone: 'danger', needsAttention: true,
    },
    {
        id: 'n-6', title: 'Results released: ENG210 continuous test 1',
        meta: '82 candidates, released to students', time: '25 Nov 2026, 13:05', tone: 'success', needsAttention: false,
    },
    {
        id: 'n-7', title: 'New assignment set: case analysis on IFRS 15',
        meta: 'ACC302 - due 28 Nov 2026, 23:59', time: '25 Nov 2026, 09:12', tone: 'info', needsAttention: false,
    },
];
