import type { FieldSpec } from '@/types/assessments/fields';

export const ruleFields: FieldSpec[] = [
    { label: 'Accepted formats', options: ['PDF, DOCX, XLSX, images', 'PDF only'] },
    { label: 'Maximum file size', options: ['25 MB', '10 MB', '50 MB'] },
    { label: 'Late submission policy', options: ['Accepted, marked with a 10% penalty', 'Not accepted after closing'] },
    { label: 'Revision after submission', options: ['Allowed until the closing date', 'Not allowed'] },
    { label: 'Individual or group', options: ['Individual', 'Group'] },
];

export const timing: FieldSpec[] = [
    { label: 'Opens', type: 'date', required: true }, { label: 'Closes', type: 'datetime-local', required: true },
    { label: 'Accepted formats', options: ['PDF, DOCX, XLSX'] }, { label: 'Size limit', options: ['25 MB'] },
    { label: 'Late policy', options: ['10% penalty', 'Not accepted'] }, { label: 'Revision', options: ['Until closing'] },
];
