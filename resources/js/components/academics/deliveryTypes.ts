import type { OfferingStatus } from './workflow';

export type Offering = {
    id: string;
    external_offering_id: string;
    status: OfferingStatus;
    section: string | null;
    curriculum_course_id: string | null;
    delivery_mode: string | null;
    semester_id: string | null;
    copied_from: string | null;
};

export type DeliveryProps = {
    offerings: Offering[];
    entries: {
        id: string;
        title: string;
        code: string;
        name: string;
        version: number;
    }[];
    terms: {
        id: string;
        label: string;
        position: number;
    }[];
    modes: string[];
};
