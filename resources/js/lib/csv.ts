import { download } from './download';

type Cell = string | number | null;

function escapeCell(value: Cell) {
    const text = String(value ?? '');
    const safe = /^\s*[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
}

export function exportSheet(name: string, columns: string[], rows: Cell[][]) {
    const csv = [columns, ...rows].map(row => row.map(escapeCell).join(',')).join('\r\n');
    download(`${name}.csv`, csv, 'text/csv;charset=utf-8');
}
