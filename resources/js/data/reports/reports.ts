import type { ReportsData } from '@/types/reports/analytics';
import { completionByFaculty, engagementMix, enrolmentTrend, examPerformance } from './analytics';
import { attention, course, courseProgress, faculty, heatmap, participation, progress, scopes, sheets } from './scopeReports';

export const reports: ReportsData = {
    institution: { enrolmentTrend, examPerformance, engagementMix, participation, completionByFaculty },
    faculty, heatmap, course, attention, progress, courseProgress, scopes,
    exports: Object.fromEntries(scopes.map(scope => [scope, sheets(scope)])),
};
