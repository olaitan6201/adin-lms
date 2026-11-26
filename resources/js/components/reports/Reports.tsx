import type { InstitutionData, ReportsData, ReportScopeId, ReportTableData } from '@/types/reports/analytics';
import { useState, type ReactNode } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { Bars, Columns, DepartmentHeatmap, Mix, Trend } from './ReportCharts';
import { Note } from '@/components/ui/feedback/Note';
import { Sections } from '@/components/ui/navigation/Sections';
import { appendExportAudit, deliverReport, type ExportFormat } from './reportExport';

function Institution({ enrolmentTrend, examPerformance, engagementMix, participation, completionByFaculty }: InstitutionData) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                <Card
                    className="xl:col-span-8"
                    title="Enrolment and delivery over the session"
                    subtitle="Registered students against active course offerings"
                >
                    <Trend data={enrolmentTrend} label="Enrolment trend" />
                </Card>
                <Card className="xl:col-span-4" title="Engagement mix" subtitle="Counted learning actions this semester">
                    <Mix items={engagementMix} />
                </Card>
            </div>
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                <Card
                    className="xl:col-span-7"
                    title="Examination performance by course"
                    subtitle="Mean score against the pass threshold"
                >
                    <Trend data={examPerformance} height={220} label="Examination performance" />
                </Card>
                <Card className="xl:col-span-5" title="Departmental participation" subtitle="Share of published material completed">
                    <Bars items={participation} />
                </Card>
            </div>
            <Card title="Completion by faculty" subtitle="Published course material completed by enrolled students">
                <Columns items={completionByFaculty} />
            </Card>
        </div>
    );
}

function DataTable({ data }: { data: ReportTableData }) {
    return (
        <Card title={data.title} subtitle={data.subtitle}>
            <Table columns={data.columns} rows={data.rows} />
        </Card>
    );
}

export function Reports({ data }: { data: ReportsData }) {
    const { institution, scopes, faculty, heatmap, course, attention, progress, courseProgress } = data;
    const [selectedId, setSelectedId] = useState<ReportScopeId>(scopes[0].id);
    const selected = scopes.find((scope) => scope.id === selectedId) ?? scopes[0];
    const [error, setError] = useState('');
    const panels: Record<ReportScopeId, ReactNode> = {
        institution: <Institution {...institution} />,
        faculty: (
            <>
                <Card title={heatmap.title} subtitle={heatmap.subtitle}>
                    <DepartmentHeatmap heatmap={heatmap} />
                </Card>
                <DataTable data={faculty} />
            </>
        ),
        course: (
            <>
                <DataTable data={course} />
                <DataTable data={attention} />
            </>
        ),
        student: (
            <>
                <DataTable data={progress} />
                <Card title="Progress by course" subtitle="Completed lessons against the published total">
                    <Bars items={courseProgress} />
                </Card>
            </>
        ),
    };
    const items = scopes.map(({ id, label }) => ({ id, label, panel: panels[id] }));

    function exportReport(format: ExportFormat) {
        if (!appendExportAudit(selected, format)) {
            setError('The export could not be recorded. Allow browser storage and try again.');
            return;
        }
        setError('');
        deliverReport(selected, format);
    }
    return (
        <div className="engagement-workspace space-y-5">
            <PageHeader
                eyebrow="Reporting and analytics"
                title="Reports and analytics"
                description="The same measures read at four scopes, from the institution down to one student."
                actions={
                    <>
                        <Badge>Figures refresh nightly</Badge>
                        <Action icon="document" size="sm" onClick={() => exportReport('PDF')}>
                            PDF
                        </Action>
                        <Action icon="sheet" size="sm" onClick={() => exportReport('Excel')}>
                            Excel
                        </Action>
                    </>
                }
            />
            {error && <p role="alert">{error}</p>}
            <Sections items={items} active={selected.id} change={setSelectedId} />
            <Note>
                Every figure can be exported as PDF or Excel. Exports respect the requesting role scope and are written to the audit
                log.
            </Note>
        </div>
    );
}
