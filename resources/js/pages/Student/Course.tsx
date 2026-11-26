import { manuscript, chapter, practice } from '@/data/learning/lesson';
import { studentModules } from '@/data/learning/courseWorkspace';
import { studyCourse } from '@/data/learning/studentStudy';
import { LessonMenu } from '@/components/learning/LessonMenu';
import { Lesson } from '@/components/learning/Lesson';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Meter, Note } from '@/components/learning/Parts';

export default function Course() {
    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow={studyCourse.week}
                title={studyCourse.title}
                description={studyCourse.summary}
                actions={
                    <>
                        <Action icon="chat" variant="outline">
                            Ask a question
                        </Action>
                        <Action icon="list" variant="outline">
                            Course outline
                        </Action>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4 space-y-5">
                    <LessonMenu studentModules={studentModules} summary={studyCourse.lessons} />
                    <Card title="Course progress">
                        <div className="space-y-3">
                            <Meter value={studyCourse.completion} label="Content completed" showValue={true} />
                            <Meter
                                value={studyCourse.submissionRate}
                                label="Assignments submitted"
                                showValue={true}
                                tone="sky"
                            />
                            <Meter
                                value={studyCourse.attendance}
                                label="Attendance"
                                showValue={true}
                                tone="sky"
                            />
                        </div>
                    </Card>
                </div>
                <div className="xl:col-span-8">
                    <Lesson manuscript={manuscript} chapter={chapter} practice={practice} />
                </div>
            </div>

            <Note tone="sky">
                Downloaded resources stay available offline. Uploaded work and examination responses always need a connection.
            </Note>
        </div>
    );
}
