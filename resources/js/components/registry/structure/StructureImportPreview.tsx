type PreviewRow = {
    line: number;
    kind: string;
    code: string;
    name: string;
    parent: string;
    existing: boolean;
};

export type Preview = {
    created: number;
    skipped: number;
    rows: PreviewRow[];
    errors: Record<string, string>;
    confirmation: string | null;
};

export function StructureImportPreview({ preview }: { preview: Preview }) {
    const errors = Object.entries(preview.errors);

    return (
        <div className="space-y-2 text-sm">
            <p role="status">{preview.created} to add · {preview.skipped} already present. Nothing saved yet.</p>
            {errors.length > 0 && (
                <ul aria-label="Rows with errors" className="space-y-1 text-rose-800">
                    {errors.map(([line, message]) => (
                        <li key={line}>Row {line}: {message}</li>
                    ))}
                </ul>
            )}
            <details open={preview.rows.length <= 10}>
                <summary className="cursor-pointer font-medium">Review matched rows ({preview.rows.length})</summary>
                <ul className="mt-2 divide-y divide-ink-100 rounded-md border border-ink-100">
                    {preview.rows.map(({ line, kind, code, name, parent, existing }) => (
                        <li className="wrap-anywhere p-2" key={line}>
                            <strong>{code} · {name}</strong>
                            <p className="text-xs text-ink-600">
                                Row {line} · {kind}{parent && ` · Parent: ${parent}`} · {existing ? 'Already present' : 'Add'}
                            </p>
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    );
}
