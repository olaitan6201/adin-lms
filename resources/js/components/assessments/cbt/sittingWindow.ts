import type { ExamWindow } from '@/types/assessments/cbt';

function validMinute(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value;
}

export function windowError({ opens, closes }: ExamWindow) {
    if (!validMinute(opens) || !validMinute(closes)) {
        return 'Enter a valid opening and closing date and time.';
    }

    return closes <= opens ? 'The access window must close after it opens.' : '';
}
