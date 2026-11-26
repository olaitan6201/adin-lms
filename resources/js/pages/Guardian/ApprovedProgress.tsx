import { useState } from 'react';
import { GuardianRequest, type RequestKind } from '@/components/guardian/GuardianRequest';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { progress, guardian, withheld } from '@/data/learning/guardian';
import { GuardianIdentity, Withheld } from '@/components/learning/GuardianIdentity';
import { Note } from '@/components/learning/Parts';
import { studentResults, offlineDownloads } from '@/data/learning/courseWorkspace';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { PublishedResults, Attendance, Deadlines, Materials } from '@/components/guardian/ProgressPanels';

export default function Progress() {
    const [request, setRequest] = useState<RequestKind | null>(null);
    const { notify } = useWorkspaceOverlays();
    const released = studentResults.filter(entry => entry.state === 'released');

    function closeRequest() {
        setRequest(null);
    }

    function finishRequest() {
        closeRequest();
        notify('Request downloaded. No message was sent or access changed.');
    }

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Guardian access"
                title="Approved progress"
                description="The published record of the student you are linked to. Nothing else about that student is shown."
                actions={
                    <>
                        <Action icon="mail" variant="outline" onClick={() => setRequest('question')}>
                            Ask a question
                        </Action>
                        <Action icon="shield" variant="primary" onClick={() => setRequest('consent')}>
                            Manage consent
                        </Action>
                    </>
                }
            />

            <div className="space-y-5">
                <Note tone="sky">
                    A guardian account can never widen its own scope. A change to what is visible is made by the Registrar against the
                    consent form, and the previous scope is kept in the audit log.
                </Note>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <GuardianIdentity guardian={guardian} />
                    <Withheld items={withheld} />
                </div>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="space-y-5">
                        <PublishedResults results={released} onIssue={() => setRequest('result')} />
                        <Deadlines rows={progress.deadlines} />
                    </div>
                    <div className="space-y-5">
                        <Attendance rows={progress.attendance} />
                        <Materials materials={offlineDownloads.slice(0, 3)} />
                    </div>
                </div>
            </div>
            {request && (
                <GuardianRequest
                    kind={request}
                    student={guardian.student.name}
                    consent={guardian.consentState}
                    courses={released.map(entry => entry.course)}
                    close={closeRequest}
                    finished={finishRequest}
                />
            )}
        </div>
    );
}
