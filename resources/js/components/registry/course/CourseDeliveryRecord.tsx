import { Progress, Details } from '@/components/registry/Records';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import type { Overview, SelectedCourse } from '@/types/registry/course';

export function CourseDeliveryRecord({
    selectedCourse,
    overview,
}: {
    selectedCourse: SelectedCourse;
    overview: Overview;
}) {
    const { offering, definition } = selectedCourse;

    return (
        <Card title="Delivery record" subtitle="The offering this overview is attached to">
            <div className="grid gap-4 lg:grid-cols-2 [&_dt]:text-ink-500">
                <Details
                    entries={[
                        ['Course code', <span className="font-mono text-[12.5px]">{definition.code}</span>],
                        ['Unit value', `${definition.units} units`],
                        ['Level', definition.level],
                        ['Semester', selectedCourse.semester],
                        ['Instructor', offering.instructor],
                        ['Registered students', offering.students],
                        ['Teaching weeks', offering.sessions],
                        ['Completion', `${offering.completion}%`],
                    ]}
                />
                <Card title="Teaching team">
                    <ul className="space-y-2">
                        {overview.team.map((t) => (
                            <li key={t} className="flex items-center gap-2 text-[13px] text-ink-700">
                                <Icon name="user" className="size-4 text-ink-400" />
                                {t}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 border-t border-ink-100 pt-3">
                        <Progress
                            stacked
                            n={overview.materials.present}
                            label={`Materials uploaded (${overview.materials.present} of ${overview.materials.required})`}
                        />
                        <p className="mt-2 text-[12px] text-amber-700">
                            {overview.materials.missing} required materials outstanding
                        </p>
                    </div>
                </Card>
            </div>
        </Card>
    );
}
