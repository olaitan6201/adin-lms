import type { GradeRow } from '@/types/assessments/gradebook';

export type Guardian = {
    student: {
        name: string;
        matric: string;
        programme: string;
        level: number;
    };
    timeline: {
        title: string;
        meta: string;
        body: string;
    }[];
    initials: string;
    consentState: string;
};

export type Health = {
    tiles: {
        label: string;
        value: string;
    }[];
    attention: {
        tab: string;
        icon: string;
        tone: string;
        title: string;
        meta: string;
    }[];
    rosterLabel: string;
    classmates: {
        name: string;
        attendance: number;
        needsAttention: boolean;
    }[];
    completion: number;
    submissions: number;
    attendanceRate: number;
};

export type TeachingModules = {
    id: string;
    week: string;
    title: string;
    items: number;
    completion: number;
    state: string;
}[];

export type TeachingResources = {
    name: string;
    type: string;
    size: string;
    version: string;
    updated: string;
    access: string;
    icon: string;
}[];

export type TeachingAssignments = {
    id: string;
    title: string;
    course: string;
    due: string;
    submissions: number;
    total: number;
    late: number;
    marked: number;
    state: string;
}[];

export type GradeRows = Pick<GradeRow, 'student' | 'ca' | 'mid' | 'total' | 'grade'>[];

export type StudyModules = {
    id: string;
    week: string;
    title: string;
    state: string;
    duration: string;
    type: string;
}[];

export type Room = {
    title: string;
    elapsed: string;
    presenter: string;
    slide: string;
    dividendQuestion: string;
    eliminationQuestion: string;
    joined: string;
    enrolled: string;
};

export type Recording = {
    id: string;
    title: string;
    course: string;
    date: string;
    length: string;
    views: number;
    transcript: string | null;
    modules: { id: string; title: string }[];
};

export type Archive = { recordings: Recording[] };

export type SessionDetails = {
    date: string;
    start: string;
    meetingLink: string;
    announcement?: string;
    checkin?: string;
};

export type SessionDraft = {
    title: string;
    course: string;
    date: string;
    start: string;
    duration: string;
    meetingLink: string;
    announcement: string;
};

export type ClassSession = {
    details?: SessionDetails;
    id: string;
    title: string;
    course: string;
    starts: string;
    duration: string;
    mode: string;
    attendees: number;
    capacity?: number;
    state: string;
};
