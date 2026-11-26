import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Courses, Marking, Performance } from '@/components/overview/LecturerPanels';
import { Columns, ComingUp, Note, Tiles } from '@/components/overview/OverviewParts';
import { offerings, schedule, submissions, tiles } from '@/data/overview/lecturer';
import { teaching } from '@/data/overview/dashboardDetails';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Overview() {
    return <>
        <PageHeader eyebrow="Teaching" title={teaching.title}
            description={teaching.description}
            actions={<><Action icon="upload" variant="outline" href={workspaceUrl('lecturer/course')}>Upload material</Action>
                <Action icon="plus" variant="primary" href={workspaceUrl('lecturer/assignments')}>Create assignment</Action></>}/>
        <div className="space-y-5">
            <Tiles items={tiles}/>
            <Columns left={<Courses offerings={offerings}/>} right={<ComingUp events={schedule}/>}/>
            <Columns left={<Marking submissions={submissions}/>} right={<Performance scores={teaching.scores} performance={teaching.performance}/>}/>
            <Note>Marks, feedback and published content are visible to the students you are allocated to. Every change is recorded in the score history.</Note>
        </div>
    </>;
}
