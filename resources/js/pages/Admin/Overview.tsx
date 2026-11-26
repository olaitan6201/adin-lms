import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import {
    Activity,
    ApprovalQueue,
    Delivery,
    Enrolment,
    Participation,
    ServiceHealth,
} from '@/components/overview/AdminPanels';
import { ExamReadiness } from '@/components/overview/ExamReadiness';
import { Columns, Note, Tiles, useFeedback } from '@/components/overview/OverviewParts';
import {
    activityFeed,
    approvals,
    completionByFaculty,
    enrolmentTrend,
    performanceMetrics,
    tiles,
} from '@/data/overview/admin';
import { institution } from '@/data/overview/dashboardDetails';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Overview() {
    const { notify, feedback } = useFeedback();
    return (
        <>
            <PageHeader
                eyebrow="Institution"
                title="Institution overview"
                description={institution.description}
                actions={
                    <>
                        <Action icon="download" variant="outline" href={workspaceUrl('admin/reports')}>
                            Export report
                        </Action>
                        <Action icon="plus" variant="primary" href={workspaceUrl('admin/delivery')}>
                            New course offering
                        </Action>
                    </>
                }
            />
            <div className="role-overview space-y-5">
                <Tiles items={tiles} />
                <Columns
                    left={
                        <Enrolment
                            session={institution.session}
                            labels={enrolmentTrend.labels}
                            series={enrolmentTrend.series[0]}
                        />
                    }
                    right={<ServiceHealth performanceMetrics={performanceMetrics} backup={institution.backup} />}
                />
                <Columns
                    left={<ApprovalQueue approvals={approvals} review={() => notify('Approval opened for review')} />}
                    right={
                        <ExamReadiness
                            bank={institution.bank}
                            exams={institution.exams}
                            subtitle={institution.examSubtitle}
                        />
                    }
                />
                <Columns
                    seven
                    left={<Delivery labels={enrolmentTrend.labels} values={enrolmentTrend.series[1].values} />}
                    right={
                        <Participation
                            completionByFaculty={completionByFaculty}
                            summary={institution.weakestCoverage}
                        />
                    }
                />
                <Activity activityFeed={activityFeed} />
                <Note>
                    Prototype data is illustrative. Counts, names and dates are fabricated for design review and do not
                    describe institutional records.
                </Note>
            </div>
            {feedback}
        </>
    );
}
