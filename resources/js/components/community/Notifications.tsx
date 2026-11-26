import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { Note } from '@/components/ui/feedback/Note';
import { type WorkspaceRole } from '@/components/identity/roles';

const categories = [
    ['Assignments and submissions', 'New assignments, deadline reminders and submission receipts.', 'Daily'],
    ['Results and grading', 'Published results, moderation outcomes and grade changes.', 'Immediate'],
    ['Examinations', 'Invigilation schedules, access windows and candidate instructions.', 'Immediate'],
    ['Announcements and messages', 'Course announcements, forum replies and direct messages.', 'Daily'],
    ['Security and access', 'New device sign-in, password changes and MFA enrolment.', 'Immediate'],
    ['Approvals and escalations', 'Items waiting for a decision and items escalated to the next officer.', 'Weekly'],
];
const switches = [
    ['Announcements from the institution', 'Notices published to every role by the Registrar or the ICT Directorate.'],
    ['Course announcements only', 'Messages from lecturers in the courses you teach or are registered for.'],
    ['Security notices always break through quiet hours', 'A new device sign-in or a failed second factor is delivered immediately.'],
    ['Weekly administrative digest', 'Approvals, usage and compliance items in one summary each Friday.'],
];
const devices = [
    ['Chrome on Windows 11','Ubulu-Unor, campus network','Today, 08:12','Current session'],
    ['Safari on iPhone 15','Warri, mobile network','24 Nov 2026, 19:40','Signed in'],
    ['Edge on Windows 10','Port Harcourt, residential network','19 Nov 2026, 08:03','Signed in'],
];
type Settings = Record<string, boolean>;
function readPrefs(key: string): Settings {
    try {
        const parsed: unknown = JSON.parse(sessionStorage.getItem(key) ?? '{}');
        return parsed && typeof parsed === 'object' ? Object.fromEntries(Object.entries(parsed).filter(([,v]) => typeof v === 'boolean')) : {};
    } catch { return {}; }
}

export function Notifications({ role }: { role: WorkspaceRole }) {
    const key = `adin:workspace:${role}:notification-fixture`;
    const [settings, setSettings] = useState(() => readPrefs(key));
    const [saved, setSaved] = useState(false);
    const [revoked, setRevoked] = useState(false);
    const [status, setStatus] = useState('');
    function toggle(id: string, checked: boolean) {
        setSettings({ ...settings, [id]: checked });
        setSaved(false);
        setStatus('');
    }
    function save() {
        try {
            sessionStorage.setItem(key, JSON.stringify(settings));
            setSaved(true);
            setStatus('Preferences saved in this browser session.');
        } catch { setStatus('Browser storage is unavailable. Your changes are still on this page.'); }
    }
    const saveButton = <Action icon="save" variant="primary" onClick={save}>Save preferences</Action>;
    return <div className="space-y-5"><PageHeader eyebrow="Preferences" title="Notification settings" description="Choose what reaches you, on which channel, and when you are interrupted."
        actions={<><Action icon="bell" onClick={() => setStatus('Test notification: your local notification preview is working.')}>Test notification</Action>{saveButton}</>}/>
        <Note>{role === 'admin' ? 'Institution-wide defaults are set in Administration under Delivery channels.' : 'Institution-wide defaults are set by the ICT Directorate.'} These preferences apply to your own account only.</Note>
        <div role="status" className="empty:hidden">{status && <Note>{status}</Note>}</div>
        <Card title="What you are notified about" subtitle="Each category can reach you by a different channel"
            actions={<><Badge tone={saved ? 'emerald' : 'slate'}>{saved ? 'Preferences saved' : 'Changes are local until saved'}</Badge>{saveButton}</>}>
            <div className="divide-y">{categories.map(([title,description,digest],i) => <fieldset className="py-4" key={title} aria-label={title}>
                <div className="flex flex-wrap justify-between gap-3"><div><strong className="text-sm">{title}</strong><p className="text-[13px] text-ink-500">{description}</p></div><Badge>{digest} digest</Badge></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">{['Email','Push notification','SMS'].map((channel,j) => {
                    const id = `${title}:${channel}`;
                    const initial = j === 0 || (j === 1 ? ![3,5].includes(i) : [1,4].includes(i));
                    return <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px]" key={id}>
                        <input type="checkbox" className="size-4 accent-brand-600" checked={settings[id] ?? initial} onChange={e => toggle(id,e.target.checked)}/>{channel}</label>;
                })}</div>
            </fieldset>)}</div>
        </Card>
        <div className="grid items-start gap-5 xl:grid-cols-2"><Card title="Quiet hours and escalation" subtitle="Urgent items always break through">
            <div className="grid gap-4 text-sm sm:grid-cols-2"><div className="space-y-2 rounded-xl border p-4"><strong>Quiet hours</strong>
                <p>Non-urgent notifications are held between 21:00 and 07:00 and delivered as one digest at 07:00.</p><p className="font-mono">21:00 to 07:00</p></div>
                <div className="space-y-2 rounded-xl border p-4"><strong>Escalation</strong><p>An approval waiting more than two working days is escalated to the next officer in the chain.</p></div></div>
            <div className="mt-4 divide-y">{switches.map(([name,description],i) => <label key={name} className="flex items-center justify-between gap-3 py-3">
                <span><strong className="text-sm">{name}</strong><small className="block text-ink-500">{description}</small></span>
                <input type="checkbox" role="switch" aria-label={name} className="size-5 shrink-0 accent-brand-600" checked={settings[name] ?? i === 2} onChange={e => toggle(name,e.target.checked)}/>
            </label>)}</div>
        </Card><Card title="Devices signed in to your account" subtitle="Revoke any device you no longer use"
            actions={!revoked && <Action size="sm" icon="logout" onClick={() => {
                setRevoked(true);
                setStatus('Other devices signed out in this local preview.');
            }}>Sign out other devices</Action>}>
            <Table columns={['Device','Last seen from','Last activity','State']} rows={(revoked ? devices.slice(0,1) : devices).map(([device,location,last,state],i) => [
                device, location, last, <Badge tone={i === 0 ? 'emerald' : 'slate'}>{state}</Badge>,
            ])}/>
        </Card></div>
    </div>;
}
