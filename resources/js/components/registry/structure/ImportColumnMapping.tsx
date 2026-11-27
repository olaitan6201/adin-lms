import { mappingFields, type Columns, type ImportField, type ImportKind } from './structureImportFields';

export function ImportColumnMapping({ kind, headers, columns, disabled, mapColumn }: {
    kind: ImportKind;
    headers: string[];
    columns: Columns;
    disabled: boolean;
    mapColumn: (field: ImportField, value: string) => void;
}) {
    return (
        <fieldset className="grid min-w-0 gap-3" disabled={disabled}>
            <legend className="mb-2 font-semibold">Match spreadsheet columns</legend>
            {mappingFields(kind).map(({ field, label }) => (
                <label key={field} className="grid min-w-0 gap-1 text-sm">
                    {label}
                    <select
                        className="min-w-0 rounded-md border border-ink-300 bg-white p-2"
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
