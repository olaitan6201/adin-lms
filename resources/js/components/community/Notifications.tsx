import type { NotificationPreferences } from '@/types/community/notifications';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { Note } from '@/components/ui/feedback/Note';
import { type WorkspaceRole } from '@/types/identity/roles';
import '../../../css/layouts/engagement.css';

type Settings = Record<string, boolean>;
function readPrefs(key: string): Settings {
    try {
        const parsed: unknown = JSON.parse(sessionStorage.getItem(key) ?? '{}');
        return parsed && typeof parsed === 'object' ? Object.fromEntries(Object.entries(parsed).filter(([,v]) => typeof v === 'boolean')) : {};
    } catch { return {}; }
}

export function Notifications({ role, data }: { role: WorkspaceRole; data: NotificationPreferences }) {
    const { categories, devices, switches, quietHours, escalation } = data;
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
    return <div className="engagement-workspace space-y-5"><PageHeader eyebrow="Preferences" title="Notification settings" description="Choose what reaches you, on which channel, and when you are interrupted."
        actions={<><Action icon="bell" onClick={() => setStatus('Test notification: your local notification preview is working.')}>Test notification</Action>{saveButton}</>}/>
        <Note>{data.defaultsNotice}</Note>
        <div role="status" className="empty:hidden">{status && <Note>{status}</Note>}</div>
        <Card title="What you are notified about" subtitle="Each category can reach you by a different channel"
            actions={<><Badge tone={saved ? 'emerald' : 'slate'}>{saved ? 'Preferences saved' : 'Changes are local until saved'}</Badge><Action icon="save" size="sm" variant="primary" onClick={save}>Save preferences</Action></>}>
            <div className="divide-y">{categories.map(({ title, description, digest, channels }) => <fieldset className="py-4" key={title} aria-label={title}>
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[13.5px] font-medium text-ink-800">{title}</p><p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">{description}</p></div><span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-medium text-ink-600">{digest} digest</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">{channels.map(({ label: channel, enabled }) => {
                    const id = `${title}:${channel}`;
                    return <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] text-ink-700" key={id}>
                        <input type="checkbox" className="size-4" checked={settings[id] ?? enabled} onChange={e => toggle(id,e.target.checked)}/>{channel}</label>;
                })}</div>
            </fieldset>)}</div>
        </Card>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2"><Card title="Quiet hours and escalation" subtitle="Urgent items always break through">
            <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border p-4"><p className="text-[13px] font-semibold">Quiet hours</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{quietHours.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs leading-[18px] text-ink-700"><span className="rounded-lg border border-ink-200 px-2.5 py-1 font-mono">{quietHours.start}</span><span className="text-ink-400">to</span><span className="rounded-lg border border-ink-200 px-2.5 py-1 font-mono">{quietHours.end}</span></div></div>
                <div className="rounded-xl border p-4"><p className="text-[13px] font-semibold">Escalation</p><p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{escalation.description}</p>
                    <p className="mt-3 flex items-center gap-2 text-xs leading-[18px] text-ink-600"><Icon name="target" className="size-4 text-brand-600"/>{escalation.timing}</p></div></div>
            <div className="mt-4 divide-y">{switches.map(({ name, description, enabled }) => <label key={name} className="flex items-start justify-between gap-6 py-3">
                <span><span className="block text-[13.5px] font-medium">{name}</span><small className="mt-0.5 block text-xs leading-relaxed text-ink-500">{description}</small></span>
                <span className="relative inline-flex shrink-0 items-center"><input type="checkbox" role="switch" aria-label={name} className="peer sr-only" checked={settings[name] ?? enabled} onChange={e => toggle(name,e.target.checked)}/>
                    <span className="h-5 w-9 rounded-full bg-ink-200 peer-checked:bg-brand-600 peer-focus-visible:ring-2"/><span className="absolute left-0.5 size-4 rounded-full bg-white shadow peer-checked:translate-x-4"/></span>
            </label>)}</div>
        </Card><Card title="Devices signed in to your account" subtitle="Revoke any device you no longer use"
            actions={!revoked && <Action size="sm" icon="logout" onClick={() => {
                setRevoked(true);
                setStatus('Other devices signed out in this local preview.');
            }}>Sign out other devices</Action>}>
            <Table columns={['Device','Last seen from','Last activity','State']} rows={(revoked ? devices.filter(d => d.current) : devices).map(({ device, location, last, state, current }) => [
                <span className="flex items-center gap-2"><Icon name="monitor" className="size-4 text-ink-400"/><span className="text-[13px] font-medium text-ink-800">{device}</span></span>, <span className="text-[12.5px] text-ink-600">{location}</span>, <span className="text-[12.5px] text-ink-600">{last}</span>, <Badge tone={current ? 'emerald' : 'slate'}>{state}</Badge>,
            ])}/>
        </Card></div>
    </div>;
}
