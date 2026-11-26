import { useState } from 'react';
import type { WorkspaceRole } from '@/types/identity/roles';

type Settings = Record<string, boolean>;
function readPrefs(key: string): Settings {
    try {
        const parsed: unknown = JSON.parse(sessionStorage.getItem(key) ?? '{}');
        return parsed && typeof parsed === 'object'
            ? Object.fromEntries(Object.entries(parsed).filter(([, v]) => typeof v === 'boolean'))
            : {};
    } catch {
        return {};
    }
}

export function useNotificationPreferences(role: WorkspaceRole) {
    const key = `adin:workspace:${role}:notification-fixture`;
    const [settings, setSettings] = useState(() => readPrefs(key));
    const [saved, setSaved] = useState(false);
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
        } catch {
            setStatus('Browser storage is unavailable. Your changes are still on this page.');
        }
    }
    return { settings, saved, status, toggle, save, setStatus };
}
