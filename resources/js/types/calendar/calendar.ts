export type CalendarEvent = {
    id: string;
    date: string;
    time: string;
    title: string;
    course: string;
    kind: string;
    owner: string;
};

export type ScheduleData = {
    today: string;
    term: string;
    events: CalendarEvent[];
    kinds: {
        kind: string;
        tone: string;
    }[];
    milestones: {
        label: string;
        date: string;
        passed: boolean;
    }[];
    defaultTime: string;
    defaultCourse: string;
};
