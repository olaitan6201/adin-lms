export interface Workspace {
    base: string;
    title: string;
    staff: boolean;
}
export interface Version {
    transcript: string | null;
    caption: string | null;
    media: {
        type: string;
        src: string;
    } | null;
    revision: number;
    author: string | null;
    image: string | null;
    body: string | null;
    external_url: string | null;
    download: string | null;
}
export interface Material {
    id: string;
    title: string;
    opens_at: string | null;
    closes_at: string | null;
    download_allowed: boolean;
    versions: Version[];
}
export interface Lesson {
    locked: boolean;
    prerequisite_id: string | null;
    published: boolean;
    id: string;
    title: string;
    position: number;
    kind: string;
    body: string | null;
    opens_at: string | null;
    closes_at: string | null;
    completed_at: string | null;
    materials: Material[];
}
export interface Participant {
    id: string;
    full_name: string;
}
export interface Session {
    accepts_marks: boolean;
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    status: string;
    meeting_url: string | null;
    recording_material_id: string | null;
    mark: string | null;
}
export interface Choice {
    id: string;
    title: string;
}

export type CourseSummary = {
    id: string;
    external_offering_id: string;
    title: string | null;
    code: string | null;
    status: string;
    section: string | null;
    delivery_mode: string | null;
};

export interface Activity {
    id: string;
    type: string;
    title: string;
    detail: string;
    href: string;
    at?: string | null;
    dateLabel?: string;
    complete?: boolean;
    actionable?: boolean;
    locked?: boolean;
    readingPreview?: string | null;
}

type Week = {
    title: string;
    body: string;
};
type Snapshot = {
    title: string;
    introduction: string;
    weeks: Week[];
    shell: {
        external_offering_id: string;
        section: string | null;
        delivery_mode: string | null;
    };
};
export type Plan = {
    id: string;
    revision: number;
    snapshot: Snapshot;
    author: string;
    reviewer: string | null;
    reason: string | null;
    status: string;
    submitted_at: string;
    reviewed_at: string | null;
    canDecide: boolean;
};
