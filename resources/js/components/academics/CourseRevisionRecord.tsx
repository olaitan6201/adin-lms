import { Badge } from '@/components/ui/badge';
import { CoreEditor } from './CoreEditor';
import type { Field } from './RecordForm';
import { statusLabel, type AcademicCoreProps, type CourseRevision } from './academicCoreTypes';

type RevisionActions = AcademicCoreProps['actions']['revisions'][string];

export function revisionFields(revision?: CourseRevision): Field[] {
    return [
        { name: 'title', label: 'Title', initial: revision?.title },
        { name: 'description', label: 'Description', type: 'textarea', initial: revision?.description ?? undefined },
        { name: 'syllabus', label: 'Syllabus', type: 'textarea', optional: true, initial: revision?.syllabus ?? undefined },
        {
            name: 'learning_outcomes',
            label: 'Learning outcomes',
            type: 'textarea',
            optional: true,
            initial: revision?.learning_outcomes ?? undefined,
        },
        {
            name: 'standard_units',
            label: 'Standard units',
            inputMode: 'decimal',
            initial: revision && String(revision.standard_units),
        },
    ];
}

export function CourseRevisionRecord({ revision, actions, edit, approve }: {
    revision: CourseRevision;
    actions?: RevisionActions;
    edit: boolean;
    approve: boolean;
}) {
    return (
        <li className="min-w-0 space-y-3 border-t border-border py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4 className="min-w-0 wrap-anywhere font-semibold">
                    Revision {revision.revision_number}: {revision.title}
                </h4>
                <Badge variant="outline">{statusLabel[revision.status]}</Badge>
            </div>
            <dl className="grid gap-3 text-sm">
                <RevisionDetail label="Standard units" value={revision.standard_units} />
                <RevisionDetail label="Description" value={revision.description} />
                <RevisionDetail label="Syllabus" value={revision.syllabus} />
                <RevisionDetail label="Learning outcomes" value={revision.learning_outcomes} />
            </dl>
            {revision.status === 'draft' && edit && actions?.update && (
                <CoreEditor
                    title="Edit draft revision"
                    submit="Save revision changes"
                    action={actions.update}
                    method="patch"
                    fields={revisionFields(revision)}
                />
            )}
            {revision.status === 'draft' && edit && actions?.review && (
                <CoreEditor
                    title="Review draft revision"
                    submit="Mark revision reviewed"
                    action={actions.review}
                    description="Confirm that you have checked the title, syllabus, learning outcomes and standard units."
                />
            )}
            {revision.status === 'reviewed' && approve && actions?.approve && (
                <CoreEditor
                    title="Approve reviewed revision"
                    submit="Approve revision"
                    action={actions.approve}
                    description="Approval makes this revision available for curriculum assignment. The approved record cannot be edited."
                />
            )}
        </li>
    );
}

function RevisionDetail({ label, value }: { label: string; value: string | number | null }) {
    return (
        <div>
            <dt className="font-medium">{label}</dt>
            <dd className="wrap-anywhere whitespace-pre-wrap text-muted-foreground">{value ?? 'Not recorded'}</dd>
        </div>
    );
}
