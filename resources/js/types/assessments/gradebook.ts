export interface GradeRow {
    student: string;
    matric: string;
    ca: number;
    participation: number;
    mid: number;
    practical: number;
    final: number;
    total: number;
    grade: string;
    state: string;
}

export interface Weight {
    item: string;
    weight: number;
    source: string;
    policy: string;
}

export interface ScoreChange {
    when: string;
    who: string;
    change: string;
    reason: string;
}

export type Metric = readonly [key: 'ca' | 'participation' | 'mid' | 'practical' | 'final', label: string, maximum: number];

export interface GradePolicy {
    boundaries: [string, number][];
    rubric: [string, string][];
    gradeWeights: Weight[];
}
