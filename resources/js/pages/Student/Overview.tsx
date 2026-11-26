import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { ContinueLearning, Courses, Notices, Pending, Results } from '@/components/overview/StudentPanels';
import { Columns, ComingUp, Note, Tiles, useFeedback } from '@/components/overview/OverviewParts';
import { courses, notifications, pending, schedule, studentResults, tiles } from '@/data/overview/student';
import { study } from '@/data/overview/dashboardDetails';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Overview() {
    const { notify, feedback } = useFeedback();
    return (
        <>
            <PageHeader
                eyebrow="Student"
                title={study.title}
                description={study.description}
                actions={
                    <>
                        <Action variant="outline" icon="download" href={workspaceUrl('student/downloads')}>
                            Download for offline
                        </Action>
                        <Action variant="primary" icon="play" href={workspaceUrl('student/course')}>
                            Resume {study.lesson.code}
                        </Action>
                    </>
                }
            />
            <div className="role-overview space-y-5">
                <Tiles items={tiles} />
                <Columns
                    left={
                        <ContinueLearning lesson={study.lesson} save={() => notify('Material saved for offline use')} />
                    }
                    right={<ComingUp student events={schedule} />}
                />
                <Columns
                    seven
                    left={
                        <Courses
                            courses={courses.map((c) => ({ ...c, lessons: study.lessonCount }))}
                            subtitle={study.coursesSubtitle}
                        />
                    }
                    right={<Pending pending={pending} />}
                />
                <Columns
                    left={<Results studentResults={studentResults} />}
                    right={<Notices notifications={notifications} />}
                />
                <Note>
                    Only released results are visible to you. Scores under moderation or awaiting approval stay hidden
                    until the examination officer publishes them.
                </Note>
            </div>
            {feedback}
        </>
    );
}
