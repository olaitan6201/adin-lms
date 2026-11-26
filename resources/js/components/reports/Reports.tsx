import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { enrolmentTrend, examPerformance } from './analyticsFixtures';
import { Bars, Columns, DepartmentHeatmap, Mix, Trend } from './ReportCharts';
import { attention, course, courseProgress, faculty, heatmap, participation, progress, scopes, sheets } from './reportData';
import { Note } from '@/components/ui/feedback/Note';
import { Sections } from '@/components/ui/navigation/Sections';
import { download } from '@/lib/download';

function exportSheet(scope: string) {
    const escape = (s: string | number) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
    const pages = sheets(scope).map(s => `<Worksheet ss:Name="${escape(s.title.slice(0,31))}"><Table>${[s.columns,...s.rows].map(r =>
        `<Row>${r.map(v => `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${escape(v)}</Data></Cell>`).join('')}</Row>`).join('')}</Table></Worksheet>`);
    download(`report-${scope.toLowerCase().replaceAll(' ','-')}.xml`, `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${pages.join('')}</Workbook>`, 'application/xml');
}

function Institution() {
    return <div className="space-y-5"><div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-8" title="Enrolment and delivery over the session" subtitle="Registered students against active course offerings"><Trend data={enrolmentTrend} label="Enrolment trend"/></Card>
        <Card className="xl:col-span-4" title="Engagement mix" subtitle="Counted learning actions this semester"><Mix/></Card>
    </div><div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-7" title="Examination performance by course" subtitle="Mean score against the pass threshold"><Trend data={examPerformance} height={220} label="Examination performance"/></Card>
        <Card className="xl:col-span-5" title="Departmental participation" subtitle="Share of published material completed"><Bars items={participation}/></Card>
    </div><Card title="Completion by faculty" subtitle="Published course material completed by enrolled students"><Columns/></Card></div>;
}

function DataTable({ data }: { data: typeof course }) {
    return <Card title={data.title} subtitle={data.subtitle}><Table columns={data.columns} rows={data.rows}/></Card>;
}

export function Reports() {
    const [scope, setScope] = useState(scopes[0]);
    const [error, setError] = useState('');
    function exportReport(format: 'PDF' | 'Excel') {
        const key = 'adin:sample-report-audit';
        try {
            const audit = JSON.parse(sessionStorage.getItem(key) ?? '[]');
            sessionStorage.setItem(key, JSON.stringify([...(Array.isArray(audit) ? audit.slice(-99) : []), { screen: location.pathname, scope, format, at: new Date().toISOString() }]));
        } catch {
            setError('The export could not be recorded. Allow browser storage and try again.');
            return;
        }
        setError('');
        if (format === 'PDF') window.print();
        else exportSheet(scope);
    }
    return <div className="space-y-5 [&_.btn-sm]:leading-5 [&_.tbl_th]:leading-5"><PageHeader eyebrow="Reporting and analytics" title="Reports and analytics"
        description="The same measures read at four scopes, from the institution down to one student."
        actions={<><Badge>Figures refresh nightly</Badge><Action icon="document" size="sm" onClick={() => exportReport('PDF')}>PDF</Action>
            <Action icon="sheet" size="sm" onClick={() => exportReport('Excel')}>Excel</Action></>}/>
        {error && <p role="alert">{error}</p>}
        <Sections names={scopes} active={scope} change={setScope} panels={[
            <Institution/>, <><Card title={heatmap.title} subtitle={heatmap.subtitle}>
            <DepartmentHeatmap/>
        </Card><DataTable data={faculty}/></>,
            <><DataTable data={course}/><DataTable data={attention}/></>,
            <><DataTable data={progress}/><Card title="Progress by course" subtitle="Completed lessons against the published total"><Bars items={courseProgress}/></Card></>,
        ]}/>
        <Note>Every figure can be exported as PDF or Excel. Exports respect the requesting role scope and are written to the audit log.</Note>
    </div>;
}
