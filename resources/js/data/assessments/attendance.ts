import type { Learner } from '@/types/assessments/attendance';

// Illustrative records for the local assessment workspace.
export const attendanceSessions = [
  { id: 'at-1', course: 'ACC302', title: 'Week 3: journals and ledgers', date: '12 Nov 2026', time: '09:00 - 10:30', present: 61, absent: 5, late: 2, state: 'closed', method: 'Manual + QR' },
  { id: 'at-2', course: 'ENG210', title: 'Week 3: voice and tone', date: '12 Nov 2026', time: '14:00 - 16:00', present: 70, absent: 9, late: 3, state: 'closed', method: 'QR' },
  { id: 'at-3', course: 'CHM401', title: 'Week 5: thermodynamics revision', date: '13 Nov 2026', time: '10:00 - 12:00', present: 38, absent: 3, late: 0, state: 'open', method: 'Manual' },
  { id: 'at-4', course: 'BSC205', title: 'Practical session: slide preparation', date: '16 Nov 2026', time: '08:00 - 11:00', present: 0, absent: 0, late: 0, state: 'scheduled', method: 'QR' }
];

export const learners: Learner[] = [
    { name: 'Blessing Okonkwo', matric: 'AOU/2023/0412', percent: 92, mark: 'present' },
    { name: 'Chinedu Okafor', matric: 'AOU/2024/1187', percent: 78, mark: 'late' },
    { name: 'Aisha Bello', matric: 'AOU/2023/0288', percent: 96, mark: 'present' },
    { name: 'Emeka Uzoma', matric: 'AOU/2022/0067', percent: 64, mark: 'absent' },
    { name: 'Fatima Sanni', matric: 'AOU/2024/1322', percent: 41, mark: 'excused' },
    { name: 'Oluwaseun Ajayi', matric: 'AOU/2023/0901', percent: 88, mark: 'present' },
    { name: 'Ngozi Obi', matric: 'AOU/2025/0044', percent: 0, mark: '' },
];

const bands = [
    { label: '90% and above', count: 48, color: 'bg-emerald-500', upperExclusive: null },
    { label: '70 to 89%', count: 62, color: 'bg-blue-500', upperExclusive: 90 },
    { label: '50 to 69%', count: 31, color: 'bg-amber-500', upperExclusive: 70 },
    { label: 'Below 50%', count: 17, color: 'bg-rose-500', upperExclusive: 50 },
] as const;

export const attendanceDesk = {
    attendanceSessions, learners, bands, sessionCount: 12, codeSuffix: '1209',
    roster: [...learners.slice(0, 4), learners[5], learners[4]],
};
