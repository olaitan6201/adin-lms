import type { WindowedAssignment } from '@/types/assessments/assignments';

const institutionalTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

export function formatInstitutionalTime(instant: number) {
    return institutionalTime.format(instant);
}

export function submissionWindow(row: WindowedAssignment, now: number) {
    if (row.state === 'closed' || now >= row.closesAt) {
        return 'Closed';
    }

    if (row.state !== 'open' || now < row.opensAt) {
        return 'Not open yet';
    }

    return 'Open';
}
