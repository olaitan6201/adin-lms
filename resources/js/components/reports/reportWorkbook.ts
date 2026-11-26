import type { ReportSheet } from '@/types/reports/analytics';

function escapeXml(value: string | number) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function cell(value: string | number) {
    const type = typeof value === 'number' ? 'Number' : 'String';
    return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function row(values: (string | number)[]) {
    return `<Row>${values.map(cell).join('')}</Row>`;
}

function worksheet(sheet: ReportSheet) {
    const title = escapeXml(sheet.title.slice(0, 31));
    const table = [sheet.columns, ...sheet.rows].map(row).join('');
    return `<Worksheet ss:Name="${title}"><Table>${table}</Table></Worksheet>`;
}

export function encodeWorkbook(sheets: ReportSheet[]) {
    const namespace = 'urn:schemas-microsoft-com:office:spreadsheet';
    return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="${namespace}" xmlns:ss="${namespace}">${sheets.map(worksheet).join('')}</Workbook>`;
}
