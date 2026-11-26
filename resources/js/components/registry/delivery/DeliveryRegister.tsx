import { useState } from 'react';
import { useDesk, Register, exportRecords } from '@/components/registry/Desk';
import { Records, status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { useOfferingManagement } from './useOfferingManagement';
import { openOfferingCreation } from './openOfferingCreation';
import { DeliveryPipeline } from './DeliveryPipeline';
import { OfferingList } from './OfferingList';
import { RosterIngestion } from './RosterIngestion';
import type { DeliveryRegisterInputs } from '@/types/registry/delivery';

export function DeliveryRegister({
    stages,
    rosterMetrics,
    formats,
    previousSessions,
    initialOfferings,
    currentTerm,
    offeringTotal,
    offerings,
    courses,
    students,
    staff,
}: DeliveryRegisterInputs) {
    const desk = useDesk();
    const [tab, setTab] = useState(0);
    const [roster, setRoster] = useState(students.slice(0, 5));
    const [filter, setFilter] = useState('');
    const { list, append, unpublish, manage } = useOfferingManagement({
        initialOfferings,
        previousSessions,
        staff,
        desk,
    });
    function add() {
        openOfferingCreation({
            courses,
            currentTerm,
            desk,
            onCreate(offering) {
                append(offering);
                setTab(0);
                setFilter('');
            },
        });
    }

    function remove(id: string) {
        setRoster((rows) => rows.filter((row) => row.id !== id));
    }

    return (
        <Register
            eyebrow="Course delivery"
            title="Course delivery"
            description="Offerings move from approved structure to published learning space, with rosters consumed from the institutional feed."
            actions={
                <>
                    <Action icon="chart" onClick={() => exportRecords('delivery-report', list)}>
                        Delivery report
                    </Action>
                    <Action icon="plus" variant="primary" onClick={add}>
                        New offering
                    </Action>
                </>
            }
            tabs={[['Offerings', list.length], ['Roster'], ['Import and export']]}
            active={tab}
            select={setTab}
            overlay={desk.overlay}
        >
            {tab === 0 && (
                <>
                    <DeliveryPipeline {...{ stages, filter, setFilter, list, offerings }} />
                    <OfferingList
                        {...{
                            list,
                            filter,
                            offeringTotal: offeringTotal + list.length - initialOfferings.length,
                            setTab,
                            manage,
                            unpublish,
                            add,
                        }}
                    />
                </>
            )}
            {tab === 1 && <RosterIngestion {...{ offerings, rosterMetrics, roster, remove }} />}
            {tab === 2 && (
                <Records
                    title="Import and export"
                    subtitle="Reusable structures and materials, with formats verified by round trip before commitment"
                    columns={['Format', 'Support', 'Verification']}
                    rows={formats.map(([format, support, detail]) => [
                        format,
                        status(support, support === 'Planned' ? 'slate' : undefined),
                        detail,
                    ])}
                />
            )}
        </Register>
    );
}
