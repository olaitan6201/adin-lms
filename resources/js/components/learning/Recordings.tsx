import { useState } from 'react';
import type { Archive, Recording } from '@/types/learning/study';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { StudyIcon } from './Parts';
import { RecordingAttachment, type Attachment } from './RecordingAttachment';

export function Recordings({ archive }: { archive: Archive }) {
    const { openDrawer, close } = useWorkspaceOverlays();
    const [attachments, setAttachments] = useState<Record<string, Attachment>>({});

    function showDetails(recording: Recording) {
        openDrawer({
            title: recording.title,
            description: `${recording.course} · ${recording.date} · ${recording.length}`,
            content: <p>No playback file is included with this sample record.</p>,
        });
    }

    function showTranscript(recording: Recording) {
        openDrawer({
            title: `Transcript: ${recording.title}`,
            description: `${recording.course} · ${recording.date} · Sample transcript`,
            content: <p>{recording.transcript ?? 'The transcript is still processing. No excerpt is available.'}</p>,
        });
    }

    function attach(recording: Recording) {
        function save(attachment: Attachment) {
            setAttachments((previous) => ({ ...previous, [recording.id]: attachment }));
            close();
        }

        openDrawer({
            title: `Attach: ${recording.title}`,
            description: `${recording.course} · ${recording.date}`,
            content: (
                <RecordingAttachment
                    recording={recording}
                    initial={attachments[recording.id]}
                    save={save}
                    cancel={close}
                />
            ),
        });
    }

    const rows = archive.recordings.map((recording) => {
        const attached = attachments[recording.id];
        const module = recording.modules.find((item) => item.id === attached?.moduleId);
        return [
            <div key="recording" className="flex items-center gap-2.5">
                <StudyIcon name="video" className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                    <p className="truncate font-medium text-ink-800">{recording.title}</p>
                    <p className="text-xs text-ink-500">{recording.course} · {recording.date}</p>
                    {attached && module && (
                        <p className="text-xs text-brand-700">Attached locally: {attached.name} · {module.title}</p>
                    )}
                </div>
            </div>,
            recording.length,
            recording.views,
            <div key="actions" className="flex flex-wrap justify-end gap-1.5">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => showDetails(recording)}>
                    View recording record
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => showTranscript(recording)}>
                    Transcript
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => attach(recording)}>
                    Attach
                </button>
            </div>,
        ];
    });

    return (
        <Card title="Recordings and asynchronous material" subtitle="Sample transcripts and local module attachments">
            <Table
                columns={['Recording', 'Length', 'Views', '']}
                rows={rows}
                rowKeys={archive.recordings.map((recording) => recording.id)}
            />
        </Card>
    );
}
