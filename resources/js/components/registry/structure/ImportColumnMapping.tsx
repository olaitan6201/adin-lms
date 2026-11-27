const fields = {
    kind: 'Record type',
    code: 'Code',
    name: 'Name',
    parent_code: 'Parent code',
};

export type Field = keyof typeof fields;
export type Columns = Record<Field, number | null>;

const targets = Object.keys(fields) as Field[];
export const emptyColumns: Columns = { kind: null, code: null, name: null, parent_code: null };

export function guessColumns(headers: string[]): Columns {
    const names = headers.map(header => header.toLowerCase().replace(/[\s-]+/g, '_'));
    const columns = { ...emptyColumns };
    for (const field of targets) {
        const index = names.indexOf(field);
        if (index !== -1) {
            columns[field] = index;
        }
    }

    return columns;
}

export function ImportColumnMapping({ headers, columns, disabled, mapColumn }: {
    headers: string[];
    columns: Columns;
    disabled: boolean;
    mapColumn: (field: Field, value: string) => void;
}) {
    return (
        <fieldset className="grid gap-3" disabled={disabled}>
            <legend className="mb-2 font-semibold">Match spreadsheet columns</legend>
            {targets.map(field => (
                <label key={field} className="grid gap-1 text-sm">
                    {fields[field]}
                    <select
                        className="rounded-md border border-ink-300 bg-white p-2"
                        onChange={event => mapColumn(field, event.target.value)}
                        value={columns[field] ?? ''}
                        required
                    >
                        <option value="">Select a column</option>
                        {headers.map((header, index) => (
                            <option key={index} value={index}>{index + 1}. {header || 'Untitled column'}</option>
                        ))}
                    </select>
                </label>
            ))}
        </fieldset>
    );
}
