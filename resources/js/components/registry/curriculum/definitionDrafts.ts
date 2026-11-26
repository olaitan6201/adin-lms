import type { CourseDefinition } from '@/types/registry/curriculum';

const key = 'adin.fixture.course-definition-drafts.v1';

function isDraft(value: unknown): value is CourseDefinition {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const row: Record<string, unknown> = { ...value };
    const fields = ['code', 'title', 'prereq', 'description', 'department', 'type'];
    return row.state === 'draft'
        && fields.every((field) => typeof row[field] === 'string')
        && Boolean(row.code && row.title)
        && [row.units, row.level, row.semester, row.revision].every(
            (number) => typeof number === 'number' && Number.isSafeInteger(number) && number > 0,
        );
}

export function loadDefinitions(seed: CourseDefinition[]): CourseDefinition[] {
    try {
        const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? '[]');
        if (!Array.isArray(saved) || !saved.every(isDraft)) {
            return seed;
        }

        const records = [...seed];
        const seen = new Set<string>();
        for (const draft of saved) {
            const code = draft.code.toUpperCase();
            const index = seed.findIndex((row) => row.code.toUpperCase() === code);
            const original = seed[index];
            const revision = original && original.state !== 'draft' ? original.revision + 1 : 1;
            if (seen.has(code) || draft.revision !== revision) {
                return seed;
            }

            seen.add(code);
            if (original?.state === 'draft') {
                records[index] = draft;
            } else {
                records.push(draft);
            }
        }

        return records;
    } catch {
        return seed;
    }
}

export function storeDefinitions(records: CourseDefinition[]) {
    sessionStorage.setItem(key, JSON.stringify(records.filter((row) => row.state === 'draft')));
}
