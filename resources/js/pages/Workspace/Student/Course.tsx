import { LessonMenu } from '@/components/study-workspace/LessonMenu';
import { Lesson } from '@/components/study-workspace/Lesson';
import { Card, Action, PageHeader } from '@/components/workspace/Elements';
import { Meter, Note } from '@/components/study-workspace/Parts';

export default function Course() {
    return (
        <>
            <PageHeader
                eyebrow="ACC302 · Week 3"
                title="Intermediate Financial Accounting"
                description="Blended delivery · Dr. Peter Adeyemi · 46% of the course completed"
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
                    <LessonMenu />
                    <Card title="Course progress">
                        <div className="space-y-3">
                            <Meter value={46} label="Content completed" showValue={true} />
                            <Meter value={75} label="Assignments submitted" showValue={true} tone="sky" />
                            <Meter value={92} label="Attendance" showValue={true} tone="sky" />
                        </div>
                    </Card>
                </div>
                <div className="xl:col-span-8">
                    <Lesson />
                </div>
            </div>

            <Note tone="sky">
                Downloaded resources stay available offline. Uploaded work and examination responses always need a connection.
            </Note>
        </>
    );
}
