import { assignments } from './assignments';
import type { Feedback, Receipt, StudentWork } from '@/types/assessments/assignments';

const receipts: Record<string, Receipt> = {
    'as-1': { number: 'RCP-2026-11-12-0412-884', file: 'okonkwo_blessing_set3.pdf', size: '1.4 MB', time: '12 Nov 2026, 21:04', note: '' },
    'as-3': { number: 'RCP-2026-11-10-0412-762', file: 'mitosis-observation.pdf', size: '2.1 MB', time: '10 Nov 2026, 17:22', note: '' },
    'as-5': { number: 'RCP-2026-11-08-0412-516', file: 'titration.pdf', size: '1.9 MB', time: '08 Nov 2026, 09:15', note: '' },

    'as-2': { number: 'RCP-2026-11-09-0412-573', file: 'revenue-recognition.pdf', size: '1.1 MB', time: '09 Nov 2026, 12:00', note: '' },
    'as-4': { number: 'RCP-2026-11-06-0412-298', file: 'narrative-voice.pdf', size: '2.3 MB', time: '06 Nov 2026, 14:30', note: '' },
};
const feedback: Record<string, Feedback> = {
    'as-3': { score: 74, text: 'Your diagram of the metaphase plate is clear. Link the observation to the cell cycle stage in the summary, which is where marks were lost.' },
    'as-5': { score: 81, text: 'Well handled. Show the calculation of the concentration from the raw readings rather than only the final value.' },
};
const rules: [string, string][] = [['Accepted formats', 'PDF, DOCX, XLSX'], ['Maximum file size', '25 MB'], ['Late submissions', 'Accepted, 10% penalty'], ['Revision', 'Until the closing time'], ['Individual or group', 'Individual']];

const work: StudentWork[] = assignments.map(assignment => ({
    assignment,
    current: { receipt: receipts[assignment.id], feedback: feedback[assignment.id] },
    previous: [],
}));

export const studentAssignments = { work, rules, sizeLimit: 25 };
