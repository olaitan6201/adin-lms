import type { InstitutionData } from '@/types/reports/analytics';
import { Card } from '@/components/ui/layout/Card';
import { Bars, Columns, Mix, Trend } from './ReportCharts';

export function Institution({
    enrolmentTrend,
    examPerformance,
    engagementMix,
    participation,
    completionByFaculty,
}: InstitutionData) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                <Card
                    className="xl:col-span-8"
                    title="Enrolment and delivery over the session"
                    subtitle="Registered students against active course offerings"
                >
                    <Trend data={enrolmentTrend} label="Enrolment trend" />
                </Card>
                <Card
                    className="xl:col-span-4"
                    title="Engagement mix"
                    subtitle="Counted learning actions this semester"
                >
                    <Mix items={engagementMix} />
                </Card>
            </div>
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                <Card
                    className="xl:col-span-7"
                    title="Examination performance by course"
                    subtitle="Mean score against the pass threshold"
                >
                    <Trend data={examPerformance} height={220} label="Examination performance" />
                </Card>
                <Card
                    className="xl:col-span-5"
                    title="Departmental participation"
                    subtitle="Share of published material completed"
                >
                    <Bars items={participation} />
                </Card>
            </div>
            <Card title="Completion by faculty" subtitle="Published course material completed by enrolled students">
                <Columns items={completionByFaculty} />
            </Card>
        </div>
    );
}
