import { useEffect, useState } from 'react';
import { SampleDownload } from '@/components/learning/SampleDownload';
import { prepareLibrary, removeFile, savedDates, type StudyFile } from '@/components/learning/deviceFiles';
import { StudyMetric, Note } from '@/components/learning/Parts';
import { FeatureStatusCard } from '@/components/students/FeatureStatusCard';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Table } from '@/components/ui/data-display/Table';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { studyFiles, studyPack } from '@/data/learning/studyFiles';
import { deviceStudy, libraryPreview } from '@/data/learning/downloads';
import { WorkspaceInstall } from '@/layouts/workspace/WorkspaceInstall';
import { Icon } from '@/components/icons/Icon';

function sampleLibraryDate(value?: string) {
    return value ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
    }) : 'Not saved';
}

export default function Downloads() {
    const [dates, setDates] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const saved = studyFiles.filter((file) => dates[file.id]);
    const latest = Object.values(dates).sort().at(-1);
    const bytes = saved.reduce((total, file) => total + file.bytes, 0);
    const initial = studyFiles.every(file => dates[file.id] === libraryPreview.dates[file.id]);
    const metrics = initial ? libraryPreview.metrics : [
        { label: 'Saved on this device', value: `${saved.length} files`, hint: `${bytes.toLocaleString()} bytes in this library` },
        { label: 'Available to save', value: `${studyFiles.length} files`, hint: 'ACC302 sample materials' },
        { label: 'Last library save', value: sampleLibraryDate(latest), hint: 'Latest copy in this library' },
    ];

    async function refresh() {
        try {
            setDates(await savedDates(studyFiles));
            setError('');
        } catch {
            setError('Device storage is unavailable. Direct downloads are still available online.');
        }
    }

    useEffect(() => {
        let active = true;
        prepareLibrary(studyFiles, libraryPreview.dates).then(() => savedDates(studyFiles)).then((loaded) => {
            if (active) {
                setDates(loaded);
            }
        }).catch(() => {
            if (active) {
                setError('Device storage is unavailable. Direct downloads are still available online.');
            }
        });
        return () => {
            active = false;
        };
    }, []);

    async function remove(file: StudyFile) {
        try {
            await removeFile(file);
            await refresh();
        } catch {
            setError('Could not remove the device copy.');
        }
    }

    const rows = studyFiles.map((file) => [
        <div key="material" className="min-w-0">
            {dates[file.id] ? (
                <SampleDownload file={file} label={`Download ${file.format}`} appearance="title" />
            ) : (
                <p className="truncate font-medium text-ink-800">{file.title}</p>
            )}
            <p className="truncate text-[11px] text-ink-400">{file.course}</p>
        </div>,
        <span key="size" className="text-[13px] tnum">
            {initial ? libraryPreview.sizes[file.id] : `${file.bytes.toLocaleString()} B`}
        </span>,
        <span key="saved" className="text-[12.5px] text-ink-500">{sampleLibraryDate(dates[file.id])}</span>,
        <Badge key="status" tone={dates[file.id] ? 'emerald' : 'sky'}>
            {dates[file.id] ? 'Available offline' : 'Available to save'}
        </Badge>,
        <div key="actions" className="flex justify-end gap-2">
            {dates[file.id] ? (
                <Action size="sm" variant="ghost" onClick={() => remove(file)}>Remove</Action>
            ) : (
                <SampleDownload
                    file={file}
                    label={`Download ${file.format}`}
                    onSaved={refresh}
                    appearance="icon"
                />
            )}
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
                        <WorkspaceInstall inPage />
                        <a className="btn btn-primary" href={studyPack.href} download={studyPack.filename}>
                            <Icon name="download" className="size-4" />
                            <span>Download all available</span>
                        </a>
                    </>
                }
            />
            <div className="space-y-5">
                {error && <p role="alert">{error}</p>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {metrics.map(metric => <StudyMetric key={metric.label} {...metric} />)}
                </div>
                <Card
                    className="[&_th:last-child]:w-[100px]"
                    title="Saved materials"
                    subtitle="Kept on this device until you remove them"
                >
                    <Table columns={['Material', 'Size', 'Saved', 'Status', '']} rows={rows} />
                </Card>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <FeatureStatusCard
                        title="Mobile access"
                        subtitle="What the phone application can do"
                        items={deviceStudy.mobileFeatures}
                        supported="Available"
                    />
                    <FeatureStatusCard
                        title="Accessibility"
                        subtitle="Target: WCAG 2.2 level AA"
                        items={deviceStudy.accessibilityFeatures}
                        supported="Supported"
                    />
                </div>
                <Note tone="sky">
                    Offline copies hold the material as it was when it was saved. Replacing a file on the server does not change a copy already on your device.
                </Note>
            </div>
        </div>
    );
}
