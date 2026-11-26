import { useState } from 'react';
import { Action, Badge, Card, PageHeader, Table } from '@/components/workspace/Elements';
import { enrolmentTrend, examPerformance } from './analyticsFixtures';
import { Bars, Columns, Mix, Trend } from './ReportCharts';
import { attention, course, courseProgress, faculty, heatmap, participation, progress, scopes, sheets } from './reportData';
import { Note, Sections, download } from '@/components/workspace/EngagementControls';

function exportSheet(scope: string) {
    const escape = (s: string | number) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
    const pages = sheets(scope).map(s => `<Worksheet ss:Name="${escape(s.title.slice(0,31))}"><Table>${[s.columns,...s.rows].map(r =>
        `<Row>${r.map(v => `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${escape(v)}</Data></Cell>`).join('')}</Row>`).join('')}</Table></Worksheet>`);
    download(`report-${scope.toLowerCase().replaceAll(' ','-')}.xml`, `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${pages.join('')}</Workbook>`, 'application/xml');
}

function Institution() {
    return <div className="space-y-5"><div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card title="Enrolment and delivery over the session" subtitle="Registered students against active course offerings"><Trend data={enrolmentTrend} label="Enrolment trend"/></Card>
        <Card title="Engagement mix" subtitle="Counted learning actions this semester"><Mix/></Card>
    </div><div className="grid gap-5 xl:grid-cols-[7fr_5fr]">
        <Card title="Examination performance by course" subtitle="Mean score against the pass threshold"><Trend data={examPerformance} label="Examination performance"/></Card>
        <Card title="Departmental participation" subtitle="Share of published material completed"><Bars items={participation}/></Card>
    </div><Card title="Completion by faculty" subtitle="Published course material completed by enrolled students"><Columns/></Card></div>;
}

function DataTable({ data }: { data: typeof course }) {
    return <Card title={data.title} subtitle={data.subtitle}><Table columns={data.columns} rows={data.rows}/></Card>;
}

export function Reports() {
    const [scope, setScope] = useState(scopes[0]);
    return <div className="space-y-5"><PageHeader eyebrow="Reporting and analytics" title="Reports and analytics"
        description="The same measures read at four scopes, from the institution down to one student."
        actions={<><Badge>Figures refresh nightly</Badge><Action icon="document" size="sm" onClick={() => window.print()}>PDF</Action>
            <Action icon="sheet" size="sm" onClick={() => exportSheet(scope)}>Excel</Action></>}/>
        <Sections names={scopes} active={scope} change={setScope} panels={[
            <Institution/>, <><Card title={heatmap.title} subtitle={heatmap.subtitle}>
            <Table columns={heatmap.columns} rows={heatmap.rows.map(([d,...values]) => [d,...values.map(v => <span className={`block rounded px-2 py-2 text-center font-medium ${Number(v) >= 80 ? 'bg-brand-700 text-white' : Number(v) >= 65 ? 'bg-brand-200 text-brand-900' : 'bg-brand-50 text-brand-900'}`}>{v}%</span>)])}/>
        </Card><DataTable data={faculty}/></>,
            <><DataTable data={course}/><DataTable data={attention}/></>,
            <><DataTable data={progress}/><Card title="Progress by course" subtitle="Completed lessons against the published total"><Bars items={courseProgress}/></Card></>,
        ]}/>
        <Note>Export the current report to Excel or use the print dialog to save it as a PDF. Figures shown are local sample data.</Note>
    </div>;
}
