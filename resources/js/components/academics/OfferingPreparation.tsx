import RecordForm, { field } from './RecordForm';
import type { Offering, DeliveryProps } from './deliveryTypes';

export function OfferingPreparation({
    o,
    path,
    entries,
    terms,
    modes,
    offerings,
}: DeliveryProps & {
    o: Offering;
    path: string;
}) {
    return (
        <>
            <RecordForm
                title="Save academic details"
                action={`${path}/prepare`}
                fields={[
                    {
                        ...field(
                            'curriculum_course_id',
                            'Approved curriculum course',
                            entries.map((e) => ({
                                id: e.id,
                                name: `${e.code} · ${e.title} (${e.name} v${e.version})`,
                            })),
                        ),
                        initial: o.curriculum_course_id ?? '',
                    },
                    {
                        ...field(
                            'semester_id',
                            'Semester',
                            terms.map((t) => ({
                                id: t.id,
                                name: `${t.label} · semester ${t.position}`,
                            })),
                        ),
                        initial: o.semester_id ?? '',
                    },
                    { ...field('section', 'Section'), initial: o.section ?? '' },
                    {
                        ...field(
                            'delivery_mode',
                            'Delivery mode',
                            modes.map((m) => ({ id: m, name: m })),
                        ),
                        initial: o.delivery_mode ?? '',
                    },
                ]}
            />
            <details>
                <summary>Copy teaching structure from another term</summary>
                <p>
                    The receiving offering must be empty. Scheduled activities shift by the difference
                    between semester start dates.
                </p>
                <RecordForm
                    title="Copy structure"
                    action={`${path}/copy`}
                    fields={[
                        field(
                            'source_id',
                            'Source offering',
                            offerings
                                .filter((s) => s.id !== o.id)
                                .map((s) => ({ id: s.id, name: s.external_offering_id })),
                        ),
                    ]}
                />
            </details>
        </>
    );
}
