export type FixtureStructure = {
    code: string;
    term: string;
    modules: string[];
    resources: string[];
};

export type Offering = {
    copiedStructure?: FixtureStructure;
    id: string;
    code: string;
    title: string;
    instructor: string;
    state: string;
    mode: string;
    term: string;
    assistants: string;
    scope: string;
    students: number;
    sessions: number;
    completion: number;
};

export type RosterStudent = {
    id: string;
    name: string;
    matric: string;
    programme: string;
    status: string;
};

export type DeliveryRegisterInputs = {
    structureSources: FixtureStructure[];
    stages: readonly (readonly [string, number, string])[];
    rosterMetrics: [string, string, string?][];
    formats: string[][];
    previousSessions: string[];
    initialOfferings: Offering[];
    currentTerm: string;
    offeringTotal: number;
    offerings: {
        code: string;
        students: number;
        state: string;
    }[];
    courses: {
        code: string;
        title: string;
    }[];
    students: RosterStudent[];
    staff: {
        name: string;
        role: string;
    }[];
};
