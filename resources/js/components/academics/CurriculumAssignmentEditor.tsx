import { CoreEditor } from './CoreEditor';
import { field, type Choice } from './RecordForm';
import { categoryLabel, requirementLabel, type Curriculum, type CurriculumEntry } from './academicCoreTypes';

export function CurriculumAssignmentEditor({ entry, levels, revisions, action }: {
    entry: CurriculumEntry;
    levels: Choice[];
    revisions: Curriculum['revisions'];
    action?: string;
}) {
    const eligible = revisions.filter(revision => revision.course_id === entry.course_id);
    if (!action || !entry.requirement_mode || !eligible.length) {
        return null;
    }

    const categories = Object.entries(categoryLabel).map(([id, name]) => ({ id, name }));
    const mode = { id: entry.requirement_mode, name: requirementLabel[entry.requirement_mode] };

    return (
        <CoreEditor
            title={`Edit assignment for ${entry.code}`}
            submit="Save assignment changes"
            action={action}
            method="patch"
            fields={[
                { ...field('course_revision_id', 'Course revision', eligible), initial: entry.course_revision_id },
                { ...field('programme_level_id', 'Programme level', levels), initial: entry.programme_level_id },
                { ...field('category', 'Category', categories), initial: entry.category ?? '' },
                { ...field('requirement_mode', 'Requirement mode', [mode]), initial: mode.id },
                { name: 'credits', label: 'Effective units', inputMode: 'decimal', initial: String(entry.credits) },
                { name: 'semester_position', label: 'Semester position', type: 'number', min: 1, max: 99, initial: String(entry.semester_position) },
            ]}
            description="The requirement mode remains unchanged so existing choice groups are preserved."
        />
    );
}
