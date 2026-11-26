export interface PaperQuestion {
    id: string;
    type: string;
    marks: number;
    stem: string;
    options: string[];
}

export interface Sitting {
    paper: PaperQuestion[]; storageKey: string; minutes: number; title: string; eyebrow: string; facts: [string,string][];
}
