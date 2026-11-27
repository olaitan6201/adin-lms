import { execFileSync } from 'node:child_process';

export function structureSpreadsheet(rows: string[][], xlsx: boolean) {
    if (!xlsx) {
        const text = rows.map(row => row.join(',')).join('\n');

        return { name: 'structure.csv', mimeType: 'text/csv', buffer: Buffer.from(text) };
    }

    const buffer = execFileSync('php', [
        '-r',
        'require "vendor/autoload.php"; $book = new PhpOffice\\PhpSpreadsheet\\Spreadsheet; $book->getActiveSheet()->fromArray(json_decode($argv[1], true, flags: JSON_THROW_ON_ERROR)); (new PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx($book))->save("php://output");',
        JSON.stringify(rows),
    ]);

    return { name: 'structure.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer };
}
