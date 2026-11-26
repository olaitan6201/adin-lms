export type ReportSeries = {
    labels: string[];
    series: {
        name: string;
        values: number[];
        color: string;
    }[];
};

export type Breakdown = {
    label: string;
    value: number;
    color: string;
}[];

export type ReportSheet = {
    title: string;
    columns: string[];
    rows: (string | number)[][];
};

export type ReportTableData = ReportSheet & { subtitle: string };

export type ReportScopeId = 'institution' | 'faculty' | 'course' | 'student';

export type ReportScope = {
    id: ReportScopeId;
    label: string;
    sheets: ReportSheet[];
};

export type InstitutionData = {
    enrolmentTrend: ReportSeries;
    examPerformance: ReportSeries;
    engagementMix: Breakdown;
    participation: Breakdown;
    completionByFaculty: Breakdown;
};

export type ReportsData = {
    institution: InstitutionData;
    faculty: ReportTableData;
    heatmap: ReportTableData;
    course: ReportTableData;
    attention: ReportTableData;
    progress: ReportTableData;
    courseProgress: Breakdown;
    scopes: [ReportScope, ...ReportScope[]];
};
