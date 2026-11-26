import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Activity, ApprovalQueue, Delivery, Enrolment, Participation, ServiceHealth } from '@/components/overview/AdminPanels';
import { ExamReadiness } from '@/components/overview/ExamReadiness';
import { Columns, Note, Tiles, useFeedback } from '@/components/overview/OverviewParts';
import { tiles } from '@/data/overview/admin';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Overview() {
    const { notify, feedback } = useFeedback();
    return <>
        <PageHeader eyebrow="Institution" title="Institution overview"
            description="Delivery, compliance and service health across every faculty for the 2025/2026 first semester."
            actions={<><Action icon="download" variant="outline" href={workspaceUrl('admin/reports')}>Export report</Action>
                <Action icon="plus" variant="primary" href={workspaceUrl('admin/delivery')}>New course offering</Action></>}/>
        <div className="space-y-5">
            <Tiles items={tiles}/>
            <Columns left={<Enrolment/>} right={<ServiceHealth/>}/>
            <Columns left={<ApprovalQueue review={() => notify('Approval opened for review')}/>} right={<ExamReadiness/>}/>
            <Columns seven left={<Delivery/>} right={<Participation/>}/>
            <Activity/>
            <Note>Prototype data is illustrative. Counts, names and dates are fabricated for design review and do not describe institutional records.</Note>
        </div>{feedback}
    </>;
}
