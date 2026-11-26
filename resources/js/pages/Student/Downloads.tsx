import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { offlineDownloads } from '@/data/learning/courseWorkspace';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { StudyMetric, Note } from '@/components/learning/Parts';

export default function Downloads() {
    const { notify } = useWorkspaceOverlays();
    const rows = offlineDownloads.map((item) => [
        <div className="min-w-0">
            <p className="truncate font-medium text-ink-800">{item.name}</p>
            <p className="truncate text-[11px] text-ink-400">{item.course}</p>
        </div>,
        <span className="text-[13px] tnum">{item.size}</span>,
        <span className="text-[12.5px] text-ink-500">{item.synced}</span>,
        <Badge tone="emerald">Available offline</Badge>,
        <div className="flex justify-end">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => notify(`${item.name} removed from this device`)}>
                Remove
            </button>
        </div>,
    ]);

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Learning"
                title="Offline downloads"
                description="Saved materials stay on this device for low bandwidth study. Work you submit always needs a connection."
                actions={
                    <>
                        <Action icon="smartphone" variant="outline">
                            Install app
                        </Action>
                        <Action icon="download" variant="primary">
                            Download all available
                        </Action>
                    </>
                }
            />

            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Saved on this device', value: '4 files', hint: '15.6 MB used' },
                        { label: 'Available to save', value: '11 files', hint: 'Across 4 courses' },
                        { label: 'Last sync', value: 'Today, 09:14', hint: 'All up to date' },
                    ].map((metric) => (
                        <StudyMetric key={metric.label} {...metric} />
                    ))}
                </div>

                <Card className="[&_th:last-child]:w-[100px]" title="Saved materials" subtitle="Kept on this device until you remove them">
                    <Table columns={['Material', 'Size', 'Saved', 'Status', '']} rows={rows} />
                </Card>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <Card title="Mobile access" subtitle="What the phone application can do">
                        <ul className="divide-y divide-ink-100">
                            {[
                                { label: 'Secure sign-in with the same credentials', state: 'Available' },
                                { label: 'Open courses and download materials', state: 'Available' },
                                { label: 'Play lecture videos with captions', state: 'Available' },
                                { label: 'Submit assignments and view receipts', state: 'Available' },
                                { label: 'Notifications for deadlines and results', state: 'Available' },
                                { label: 'Join discussions and message staff', state: 'Available' },
                                { label: 'Sit examinations where the device allows it', state: 'Device dependent' },
                            ].map((item) => (
                                <li key={item.label} className="flex items-center justify-between gap-3 py-2.5">
                                    <span className="text-[13px] text-ink-700">{item.label}</span>
                                    <Badge tone={item.state === 'Available' ? 'emerald' : 'amber'}>{item.state}</Badge>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card title="Accessibility" subtitle="Target: WCAG 2.2 level AA">
                        <ul className="divide-y divide-ink-100">
                            {[
                                { label: 'Keyboard navigation across every screen', state: 'Supported' },
                                { label: 'Screen reader labels on controls and charts', state: 'Supported' },
                                { label: 'Text size control in the top bar', state: 'Supported' },
                                { label: 'Colour contrast checked against AA thresholds', state: 'Supported' },
                                { label: 'Captions and transcripts for recorded classes', state: 'Where available' },
                                { label: 'Accessible examination flow', state: 'Supported' },
                            ].map((item) => (
                                <li key={item.label} className="flex items-center justify-between gap-3 py-2.5">
                                    <span className="text-[13px] text-ink-700">{item.label}</span>
                                    <Badge tone={item.state === 'Supported' ? 'emerald' : 'amber'}>{item.state}</Badge>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                <Note tone="sky">
                    Offline copies hold the material as it was when it was saved. Replacing a file on the server does not change a copy already
                    on your device.
                </Note>
            </div>
        </div>
    );
}
