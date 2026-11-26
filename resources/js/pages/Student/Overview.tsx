import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { ContinueLearning, Courses, Notices, Pending, Results } from '@/components/overview/StudentPanels';
import { Columns, ComingUp, Note, Tiles, useFeedback } from '@/components/overview/OverviewParts';
import { schedule, tiles } from '@/data/overview/student';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Overview() {
    const { notify, feedback } = useFeedback();
    return <>
        <PageHeader eyebrow="Student" title="Welcome back, Blessing"
            description="Four courses are running this semester. One assignment is due in two days and your ACC302 mid-term opens on 18 November."
            actions={<><Action variant="outline" icon="download" href={workspaceUrl('student/downloads')}>Download for offline</Action>
                <Action variant="primary" icon="play" href={workspaceUrl('student/course')}>Resume ACC302</Action></>}/>
        <div className="space-y-5">
            <Tiles items={tiles}/>
            <Columns left={<ContinueLearning save={() => notify('Material saved for offline use')}/>} right={<ComingUp student events={schedule}/>}/>
            <Columns seven left={<Courses/>} right={<Pending/>}/>
            <Columns left={<Results/>} right={<Notices/>}/>
            <Note>Only released results are visible to you. Scores under moderation or awaiting approval stay hidden until the examination officer publishes them.</Note>
        </div>{feedback}
    </>;
}
