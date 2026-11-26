import { OfferingSettings } from './OfferingSettings';
import { useState } from 'react';
import type { Desk } from '@/components/registry/Desk';
import { val } from '@/components/registry/Records';
import type { Offering } from '@/types/registry/delivery';

export function useOfferingManagement({
    initialOfferings,
    previousSessions,
    staff,
    desk,
}: {
    initialOfferings: Offering[];
    previousSessions: string[];
    staff: { name: string; role: string }[];
    desk: Desk;
}) {
    const [list, setList] = useState(initialOfferings);

    function append(offering: Offering) {
        setList((records) => [...records, offering]);
    }

    function updateOffering(id: string, changes: Partial<Offering>) {
        setList((records) => records.map((record) => (record.id === id ? { ...record, ...changes } : record)));
    }

    function unpublish(offering: Offering) {
        desk.show({
            title: 'Unpublish this offering',
            confirm: true,
            submit: 'Unpublish offering',
            body: `Unpublishing ${offering.code} withdraws the course from students who are not yet enrolled. Existing registrations, submissions and results are kept, and students already enrolled keep access to what they have been given.`,
            message: `${offering.code} was unpublished. Existing registrations and results are unchanged.`,
            save: () => updateOffering(offering.id, { state: 'approved' }),
        });
    }

    function manage(offering: Offering) {
        desk.show({
            title: `${offering.code} · ${offering.title}`,
            subtitle: `${offering.term.replace('S1', 'First Semester')} · ${offering.mode}`,
            submit: 'Save offering',
            message: 'Offering saved',
            body: (
                <OfferingSettings
                    offering={offering}
                    {...{ staff, previousSessions, unpublish }}
                    copyStructure={() => desk.notify('Structure copied: modules and resources only')}
                />
            ),
            save: (data) =>
                updateOffering(offering.id, {
                    instructor: val(data, 'Lead instructor'),
                    assistants: val(data, 'Teaching assistants'),
                    scope: val(data, 'Access scope'),
                }),
        });
    }
    return { list, append, unpublish, manage };
}
