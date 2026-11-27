import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { manuscript, chapter, practice, lessonExcerpts } from '@/data/learning/lesson';
import { studentModules } from '@/data/learning/courseWorkspace';
import { Meter, Note } from '@/components/learning/Parts';
import { studyCourse, registration } from '@/data/learning/studentStudy';
import { studyFiles } from '@/data/learning/studyFiles';
import { SelectedCourseSummary } from '@/components/learning/SelectedCourseSummary';
import { LessonMenu } from '@/components/learning/LessonMenu';
import { Lesson } from '@/components/learning/Lesson';
import { SampleDownload } from '@/components/learning/SampleDownload';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';

export default function Course() {
    const code = new URL(usePage().url, 'http://workspace.local').searchParams.get('course') ?? 'ACC302';
    const course = registration.courses.find((item) => item.code === code);
    const { openDrawer } = useWorkspaceOverlays();
    const [selected, select] = useState('sm-3');
    const [completed, setCompleted] = useState<string[]>([]);
    if (!course || course.code !== 'ACC302') {
        return (
            <SelectedCourseSummary
                course={course}
                back={workspaceUrl('student/courses')}
                description={`${course?.lecturer} · ${course?.mode} · Next: ${course?.next}`}
            />
        );
    }

    const modules = studentModules.map((item) => completed.includes(item.id) ? { ...item, state: 'complete' } : item);
    const index = modules.findIndex((item) => item.id === selected);
    const current = modules[index];
    const previous = modules[index - 1];
    const next = modules[index + 1];
    const isManuscript = current.id === 'sm-3';
    const materialId = isManuscript ? 'week-3-manuscript' : current.id === 'sm-4' ? 'practice-set' : undefined;
    const material = studyFiles.find((item) => item.course === course.code && item.id === materialId);

    function showOutline() {
        openDrawer({
            title: 'ACC302 course outline',
            content: (
                <ol>
                    {modules.map((item) => (
                        <li key={item.id}>{item.week}: {item.title} · {item.state}</li>
                    ))}
                </ol>
            ),
        });
    }

    const actions = (
        <>
            {material && <SampleDownload file={material} label="Save offline" appearance="labelled" />}
            <Action
                icon="check"
                variant="primary"
                size="sm"
                aria-label={current.state === 'complete' ? 'Complete' : 'Mark complete for this visit'}
                disabled={current.state === 'complete'}
                onClick={() => setCompleted([...completed, current.id])}
            >
                {current.state === 'complete' ? 'Complete' : 'Mark complete'}
            </Action>
        </>
    );
    const navigation = (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
            <Action disabled={!previous} onClick={() => select(previous.id)}>Previous lesson</Action>
            <Action variant="primary" disabled={!next || next.state === 'locked'} onClick={() => select(next.id)}>
                {isManuscript ? manuscript.next : next?.state === 'locked' ? 'Next lesson locked' : 'Next lesson'}
            </Action>
        </div>
    );

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow={`${code} · ${current.week}`}
                title={course.title}
                description={studyCourse.summary}
                actions={
                    <>
                        <Action icon="chat" href={workspaceUrl('student/communication')}>Ask a question</Action>
                        <Action icon="list" onClick={showOutline}>Course outline</Action>
                    </>
                }
            />
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-4">
                    <LessonMenu
                        studentModules={modules}
                        summary={completed.length ? `${completed.length} marked complete this visit` : studyCourse.lessons}
                        selected={selected}
                        select={select}
                    />
                    <Card title="Course progress">
                        <div className="space-y-3">
                            <Meter value={studyCourse.completion} label="Content completed" showValue />
                            <Meter
                                value={studyCourse.submissionRate}
                                label="Assignments submitted"
                                showValue
                                tone="sky"
                            />
                            <Meter
                                value={studyCourse.attendance}
                                label="Attendance"
                                showValue
                                tone="sky"
                            />
                        </div>
                    </Card>
                </div>
                <div className="xl:col-span-8">
                    {isManuscript ? (
                        <Lesson
                            manuscript={manuscript}
                            chapter={chapter}
                            practice={practice}
                            materials={studyFiles.slice(0, 3)}
                            openPractice={() => select('sm-4')}
                            actions={actions}
                            navigation={navigation}
                        />
                    ) : (
                        <Card title={current.title} subtitle={`${current.week} · ${current.type}`} actions={actions}>
                            <p className="whitespace-pre-line">{lessonExcerpts[current.id]}</p>
                            {navigation}
                        </Card>
                    )}
                </div>
            </div>
            <Note tone="sky">
                Downloaded resources stay available offline. Uploaded work and examination responses always need a connection.
            </Note>
        </div>
    );
}
