import { useState } from 'react';
import { useDesk, Register, Field } from '@/components/registry/Desk';
import { Note } from '@/components/ui/feedback/Note';
import { val } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { CourseOverview } from './CourseOverview';
import { CoursePlan } from './CoursePlan';
import { CourseDeliveryRecord } from './CourseDeliveryRecord';
import type { CourseRecordInputs } from '@/types/registry/course';

export function CourseRecord({ selectedCourse, courseModules, gradeWeights }: CourseRecordInputs) {
    const desk = useDesk();
    const [overview, setOverview] = useState(selectedCourse.overview);
    const [draft, setDraft] = useState(false);
    const { definition } = selectedCourse;

    function edit() {
        desk.show({
            title: 'Edit overview',
            subtitle: `${definition.code} · ${definition.title}`,
            submit: 'Save draft',
            body: (
                <>
                    <Field label="Purpose" type="textarea" value={overview.purpose} required />
                    <Field label="Course outline" type="textarea" value={overview.outline} required />
                    <Field label="Entry requirement" value={overview.entry} />
                    <Field label="Delivery mode" value={overview.delivery} />
                </>
            ),
            save: saveOverviewDraft,
        });
    }

    function saveOverviewDraft(data: FormData) {
        setOverview({
            ...overview,
            purpose: val(data, 'Purpose'),
            outline: val(data, 'Course outline'),
            entry: val(data, 'Entry requirement'),
            delivery: val(data, 'Delivery mode'),
        });
        setDraft(true);
    }

    return (
        <Register
            title={`${definition.code} ${definition.title}`}
            eyebrow="Academic"
            description="The catalogue record a student, a lecturer and a reviewer all read from the same source."
            actions={
                <>
                    <Action icon="eye" href={workspaceUrl('student/course')}>
                        Preview as student
                    </Action>
                    <Action icon="edit" variant="primary" onClick={edit}>
                        Edit course
                    </Action>
                </>
            }
            overlay={desk.overlay}
        >
            <Note>
                {draft
                    ? `The overview and outline shown here are a draft for the ${selectedCourse.session} session. Students continue to see the approved version until this draft is approved.`
                    : `The overview, outline and outcome mapping shown here are the approved version for the ${selectedCourse.session} session. Any change starts a new draft and requires re-approval before it reaches students.`}
            </Note>
            <CourseOverview {...{ overview, draft, edit }} />
            <CoursePlan {...{ courseModules, gradeWeights, overview }} />
            <CourseDeliveryRecord {...{ selectedCourse, overview }} />
        </Register>
    );
}
