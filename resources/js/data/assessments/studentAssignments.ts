import { assignments } from './assignments';
import { formatInstitutionalTime } from '@/lib/submissionWindow';
import type { Feedback, Receipt, StudentWork } from '@/types/assessments/assignments';

function receipt(number: string, file: string, size: string, instant: string): Receipt {
    const issuedAt = Date.parse(instant);
    return { number, file, size, issuedAt, time: `${formatInstitutionalTime(issuedAt)} WAT`, note: '' };
}

const receipts: Partial<Record<string, Receipt>> = {
    'as-1': receipt('RCP-2026-11-12-0412-884', 'okonkwo_blessing_set3.pdf', '1.4 MB', '2026-11-12T21:04:00+01:00'),
    'as-3': receipt('RCP-2026-11-10-0412-762', 'mitosis-observation.pdf', '2.1 MB', '2026-11-10T17:22:00+01:00'),
    'as-4': receipt('RCP-2026-11-06-0412-298', 'narrative-voice.pdf', '2.3 MB', '2026-11-06T14:30:00+01:00'),
    'as-5': receipt('RCP-2026-11-08-0412-516', 'titration.pdf', '1.9 MB', '2026-11-08T09:15:00+01:00'),
};
const feedback: Record<string, Feedback> = {
    'as-3': {
        score: 74,
        excerpt: 'Observation: the chromosomes lie across the centre of the cell.',
        text: 'Your diagram of the metaphase plate is clear. Link the observation to the cell cycle stage in the summary, which is where marks were lost.',
    },
    'as-5': {
        score: 81,
        excerpt: 'Conclusion: the concentration of the sample is 0.10 mol/L.',
        text: 'Well handled. Show the calculation of the concentration from the raw readings rather than only the final value.',
    },
};
const rules: [string, string][] = [['Accepted formats', 'PDF, DOCX, XLSX'], ['Maximum file size', '25 MB'], ['Late submissions', 'Accepted, 10% penalty'], ['Revision', 'Until the closing time'], ['Individual or group', 'Individual']];

const work: StudentWork[] = assignments.map(assignment => {
    const issued = receipts[assignment.id];
    return {
        assignment,
        current: issued ? { receipt: issued, feedback: feedback[assignment.id] } : undefined,
        previous: [],
    };
});

const sampleTime = Date.parse('2026-11-13T12:00:00+01:00');

export const studentAssignments = { work, rules, sizeLimit: 25, sampleTime };

export const assignmentPreview = {
    rows: [
        { id: 'as-1', status: 'Submitted', tone: 'sky', action: 'View receipt' },
        { id: 'as-2', status: 'Submitted', tone: 'sky', action: 'View receipt' },
        { id: 'as-3', status: 'Graded', tone: 'emerald', score: 72, action: 'View receipt' },
        { id: 'as-4', status: 'Submitted', tone: 'sky', action: 'View receipt' },
    ],
    receipts: ['as-1', 'as-3', 'as-5'],
    outstanding: 3,
} as const;
