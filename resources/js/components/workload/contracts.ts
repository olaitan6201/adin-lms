export type ClassDetails = {
    id: string;
    code: string;
    title: string;
    section: string | null;
    status: string;
    credits: string | null;
    term: string | null;
};

export type ClassTotals = {
    enrolled: number;
    completed: number;
    released_results: number;
    average_percent: string | null;
};

export type WorkloadTotals = Omit<ClassTotals, 'average_percent'> & { classes: number };

export type WorkloadClass = ClassDetails & {
    report_url: string;
    totals: ClassTotals;
};

type Term = {
    id: string;
    label: string;
};

export type WorkloadData = {
    terms: Term[];
    selected_term: string | null;
    classes: WorkloadClass[];
    totals: WorkloadTotals;
};

export type ClassReport = {
    groups: {
        id: string;
        name: string;
        members: number;
        lessons: number;
    }[];
    activity: import('./TeachingFigures').Activity | null;
    class: ClassDetails;
    allocation: {
        lecturer: string;
        staff_number: string;
    };
    totals: ClassTotals;
};

type ReportView = {
    report: ClassReport;
    workload?: never;
};

type TermView = {
    report: null;
    workload: WorkloadData;
};

export type WorkloadProps = ReportView | TermView;
