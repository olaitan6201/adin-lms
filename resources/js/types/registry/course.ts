export type Overview = {
    purpose: string;
    outline: string;
    entry: string;
    delivery: string;
    outcomes: {
        code: string;
        text: string;
        mapped: string;
    }[];
    materials: {
        present: number;
        required: number;
        missing: number;
    };
    team: string[];
};

export type SelectedCourse = {
    session: string;
    semester: string;
    overview: Overview;
    definition: {
        code: string;
        title: string;
        units: number;
        level: number;
    };
    offering: {
        instructor: string;
        students: number;
        sessions: number;
        completion: number;
    };
};

export type CourseRecordInputs = {
    selectedCourse: SelectedCourse;
    courseModules: {
        week: string;
        title: string;
        items: number;
        state: string;
        completion: number;
    }[];
    gradeWeights: {
        item: string;
        source: string;
        weight: number;
        policy: string;
    }[];
};
