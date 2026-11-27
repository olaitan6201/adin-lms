const fieldLabels = {
    kind: 'Record type',
    code: 'Code',
    name: 'Name',
    parent_code: 'Parent code',
    department_code: 'Department code',
    programme_code: 'Programme code',
    specialization_code: 'Specialization code',
    position: 'Position',
};

export type ImportField = keyof typeof fieldLabels;
export type Columns = Partial<Record<ImportField, number | null>>;
export type ImportKind = 'hierarchy' | 'register';
export type ImportUrls = Record<'template' | 'columns' | 'preview' | 'store', string>;

const fields: Record<ImportKind, readonly ImportField[]> = {
    hierarchy: ['kind', 'code', 'name', 'parent_code'],
    register: ['kind', 'code', 'name', 'department_code', 'programme_code', 'specialization_code', 'position'],
};

export function mappingFields(kind: ImportKind) {
    return fields[kind].map(field => ({ field, label: fieldLabels[field] }));
}

export function guessColumns(kind: ImportKind, headers: string[]): Columns {
    const names = headers.map(header => header.toLowerCase().replace(/[\s-]+/g, '_'));
    const columns: Columns = {};

    for (const field of fields[kind]) {
        const index = names.indexOf(field);
        columns[field] = index === -1 ? null : index;
    }

    return columns;
}
