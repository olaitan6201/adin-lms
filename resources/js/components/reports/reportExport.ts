import type { ReportScope } from '@/types/reports/analytics';
import { download } from '@/lib/download';
import { encodeWorkbook } from './reportWorkbook';

export type ExportFormat = 'PDF' | 'Excel';

export function appendExportAudit(scope: ReportScope, format: ExportFormat) {
    const key = 'adin:sample-report-audit';
    try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(key) ?? '[]');
        const recent = Array.isArray(stored) ? stored.slice(-99) : [];
        const entry = { screen: location.pathname, scope: scope.label, scopeId: scope.id, format, at: new Date().toISOString() };
        sessionStorage.setItem(key, JSON.stringify([...recent, entry]));
        return true;
    } catch {
        return false;
    }
}

export function deliverReport(scope: ReportScope, format: ExportFormat) {
    if (format === 'PDF') {
        window.print();
    } else {
        const filename = `report-${scope.label.toLowerCase().replaceAll(' ', '-')}.xml`;
        download(filename, encodeWorkbook(scope.sheets), 'application/xml');
    }
}
