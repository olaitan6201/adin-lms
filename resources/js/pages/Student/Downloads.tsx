import { deviceStudy } from '@/data/learning/downloads';
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
                    {deviceStudy.metrics.map((metric) => (
                        <StudyMetric key={metric.label} {...metric} />
                    ))}
                </div>

                <Card className="[&_th:last-child]:w-[100px]" title="Saved materials" subtitle="Kept on this device until you remove them">
                    <Table columns={['Material', 'Size', 'Saved', 'Status', '']} rows={rows} />
                </Card>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <Card title="Mobile access" subtitle="What the phone application can do">
                        <ul className="divide-y divide-ink-100">
                            {deviceStudy.mobileFeatures.map((item) => (
                                <li key={item.label} className="flex items-center justify-between gap-3 py-2.5">
                                    <span className="text-[13px] text-ink-700">{item.label}</span>
                                    <Badge tone={item.state === 'Available' ? 'emerald' : 'amber'}>{item.state}</Badge>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card title="Accessibility" subtitle="Target: WCAG 2.2 level AA">
                        <ul className="divide-y divide-ink-100">
                            {deviceStudy.accessibilityFeatures.map((item) => (
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
