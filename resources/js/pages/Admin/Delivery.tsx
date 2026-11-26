import {
    stages,
    rosterMetrics,
    formats,
    previousSessions,
    initialOfferings,
    currentTerm,
    offeringTotal,
} from '@/data/registry/deliveryRegister';
import { offerings, courses } from '@/data/registry/academics';
import { students, staff } from '@/data/registry/people';
import { DeliveryRegister } from '@/components/registry/delivery/DeliveryRegister';

export default function Delivery() {
    return (
        <DeliveryRegister
            {...{
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
            }}
        />
    );
}
