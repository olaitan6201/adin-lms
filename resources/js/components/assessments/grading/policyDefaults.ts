import type { PolicyItem } from './PolicyItemFields';

export type PolicyDefinition = {
    rounding: string;
    boundaries: {
        minimum: string;
        grade: string;
    }[];
    items: PolicyItem[];
};

let nextItemKey = 0;

export const emptyItem = (): PolicyItem => ({
    clientKey: `new-${++nextItemKey}`,
    title: '',
    kind: 'assignment',
    maximum: '',
    weight: '100',
    rubric: '',
    criteria: [],
});

export const emptyPolicy = (): PolicyDefinition => ({
    rounding: 'half_up',
    boundaries: [{ minimum: '0', grade: '' }],
    items: [emptyItem()],
});
