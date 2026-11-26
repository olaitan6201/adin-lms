import { useEffect, useState } from 'react';
import { SampleDownload } from '@/components/learning/SampleDownload';
import { removeFile, savedDates, type StudyFile } from '@/components/learning/deviceFiles';
import { StudyMetric, Note } from '@/components/learning/Parts';
import { FeatureStatusCard } from '@/components/students/FeatureStatusCard';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Table } from '@/components/ui/data-display/Table';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { studyFiles, studyPack } from '@/data/learning/studyFiles';
import { deviceStudy } from '@/data/learning/downloads';
import { WorkspaceInstall } from '@/layouts/workspace/WorkspaceInstall';

function sampleLibraryDate(value?: string) {
    return value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not saved';
}

export default function Downloads() {
    const [dates, setDates] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const saved = studyFiles.filter((file) => dates[file.id]);
    const latest = Object.values(dates).sort().at(-1);
    const bytes = saved.reduce((total, file) => total + file.bytes, 0);

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
        savedDates(studyFiles).then((initial) => {
            if (active) {
                setDates(initial);
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
        <div key="material">
            <p className="font-medium">{file.title}</p>
            <p className="text-xs text-ink-500">{file.course}</p>
        </div>,
        `${file.bytes.toLocaleString()} B`,
        sampleLibraryDate(dates[file.id]),
        <Badge key="status" tone={dates[file.id] ? 'emerald' : 'sky'}>
            {dates[file.id] ? 'Available offline' : 'Available to save'}
        </Badge>,
        <div key="actions" className="flex gap-2">
            <SampleDownload file={file} label={`Download ${file.format}`} onSaved={refresh} />
            {dates[file.id] && <Action onClick={() => remove(file)}>Remove</Action>}
        </div>,
    ]);

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Learning"
                title="Offline downloads"
                description="Download a sample file to keep a library copy on this device, or get all four originals together as a ZIP."
                actions={
                    <>
                        <WorkspaceInstall />
                        <a className="btn btn-primary" href={studyPack.href} download={studyPack.filename}>Download all available</a>
                    </>
                }
            />
            <div className="space-y-5">
                {error && <p role="alert">{error}</p>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudyMetric label="Saved on this device" value={`${saved.length} files`} hint={`${bytes.toLocaleString()} bytes in this library`} />
                    <StudyMetric label="Available to save" value={`${studyFiles.length} files`} hint="ACC302 sample materials" />
                    <StudyMetric label="Last library save" value={sampleLibraryDate(latest)} hint="Latest copy in this library" />
                </div>
                <Card title="Saved materials" subtitle="Saved status applies to this browser library. The ZIP downloads separately.">
                    <Table columns={['Material', 'Size', 'Saved', 'Status', '']} rows={rows} />
                </Card>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <FeatureStatusCard
                        title="Mobile access"
                        subtitle="Reference feature checklist"
                        items={deviceStudy.mobileFeatures}
                        supported="Available"
                    />
                    <FeatureStatusCard
                        title="Accessibility"
                        subtitle="Design target: WCAG 2.2 level AA"
                        items={deviceStudy.accessibilityFeatures}
                        supported="Supported"
                    />
                </div>
                <Note tone="sky">
                    Offline copies hold the material as it was when saved. Removing a library copy does not delete files from your browser downloads.
                </Note>
            </div>
        </div>
    );
}
