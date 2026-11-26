import type { Filters, Options } from '@/components/reports/ReportFilters';

export const names = {
    'institution-usage': 'Institution usage',
    completion: 'Course completion',
    engagement: 'Lesson engagement',
    attendance: 'Class attendance',
    examinations: 'Exam performance',
    activity: 'Academic activity',
};
export const descriptions = {
    'institution-usage':
        'Current institution-wide populations and recorded activity over the past seven days (UTC, start exclusive and end inclusive). A zero means no matching record; credential acceptances are not a measure of time spent learning.',
    completion:
        'Completed registrations divided by current registrations. The total is weighted by registrations. A dash means there is no denominator.',
    engagement:
        'The share of current registrations with at least one recorded lesson visit in the offering. Repeat visits to the same lesson count once per learner.',
    attendance: 'Each class shows marked attendance and current registrations without a mark. Unmarked learners are not counted as absent.',
    examinations: 'Mean points use the latest released score for each registration. A dash means no scores have been released.',
    activity: 'Course activity, enrolments, submissions and released results within your selection.',
};
export type Family = keyof typeof names;
export type ReportProps = {
    family: Family;
    audience: string;
    reportScope: string | null;
    canViewInstitutionUsage: boolean;
    filters: Filters;
    options: Options | null;
    columns: string[];
    table: {
        rows: (string | number)[][];
        totals: Record<string, number>;
    };
    limitMessage: string | null;
};

export function reportSummary(family: Family, scope: string | null, limit: string | null, rows: number, filters: number) {
    if (!scope) return 'No reporting scope assigned.';
    if (limit) return limit;
    // Completion includes its totals row even when no offering matches.
    if (rows > (family === 'completion' ? 1 : 0)) return `${rows} report ${rows === 1 ? 'row' : 'rows'}`;
    return filters ? 'No records match these filters.' : 'No records for this report yet.';
}
