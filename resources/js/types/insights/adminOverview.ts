type Metric = { label: string; value: number; color: string };
type Series = { labels: string[]; values: number[] };

export type AdminOverviewData = {
    description: string;
    tiles: { label: string; value: string | null; deltaLabel: string; icon: string }[];
    enrolment: Series & { session: string };
    service: { metrics: Metric[]; note: string };
    approvals: { id: string; title: string; meta: string; status: string; href: string }[];
    examinations: {
        available: boolean;
        bank: Metric[];
        exams: { id: string; title: string; meta: string; status: string }[];
        subtitle: string;
    };
    delivery: Series;
    participation: { metrics: (Metric & { id: string })[]; summary: string };
    activity: { id: string; who: string; action: string; when: string }[];
    links: {
        reports: string | null;
        offerings: string | null;
        structure: string | null;
    };
};
