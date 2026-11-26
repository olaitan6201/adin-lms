import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Courses, Marking, Performance } from '@/components/overview/LecturerPanels';
import { Columns, ComingUp, Note, Tiles } from '@/components/overview/OverviewParts';
import { schedule, tiles } from '@/components/overview/lecturerFixtures';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Overview() {
    return <>
        <PageHeader eyebrow="Teaching" title="Good afternoon, Dr. Adeyemi"
            description="Three courses are running this semester. Two submissions arrived after the deadline and one is waiting for a second marker."
            actions={<><Action icon="upload" variant="outline" href={workspaceUrl('lecturer/course')}>Upload material</Action>
                <Action icon="plus" variant="primary" href={workspaceUrl('lecturer/assignments')}>Create assignment</Action></>}/>
        <div className="space-y-5">
            <Tiles items={tiles}/>
            <Columns left={<Courses/>} right={<ComingUp events={schedule}/>}/>
            <Columns left={<Marking/>} right={<Performance/>}/>
            <Note>Marks, feedback and published content are visible to the students you are allocated to. Every change is recorded in the score history.</Note>
        </div>
    </>;
}
