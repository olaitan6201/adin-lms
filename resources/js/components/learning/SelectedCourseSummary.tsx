import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import type { ReactNode } from 'react';

export function SelectedCourseSummary({ course, back, description, children }: {
    course?: { code: string; title: string };
    back: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <div className="learning-surface space-y-5">
            <PageHeader
                eyebrow={course?.code ?? 'Learning'}
                title={course?.title ?? 'Course unavailable'}
                description={course ? description : 'This course is not in your sample course list.'}
                actions={<Action href={back}>My courses</Action>}
            />
            {course && (
                <Card title="Course content">
                    <p>No sample manuscript is available for this course.</p>
                </Card>
            )}
            {children}
        </div>
    );
}
