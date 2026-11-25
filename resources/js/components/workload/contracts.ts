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

export type WorkloadClass = ClassDetails & { report_url: string; totals: ClassTotals };
export type WorkloadData = {
    terms: { id: string; label: string }[];
    selected_term: string | null;
    classes: WorkloadClass[];
    totals: WorkloadTotals;
};
export type ClassReport = {
    class: ClassDetails;
    allocation: { lecturer: string; staff_number: string };
    totals: ClassTotals;
};
export type WorkloadProps =
    { report: ClassReport; workload?: never } | { report: null; workload: WorkloadData };
