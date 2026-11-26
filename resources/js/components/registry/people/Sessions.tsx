import { createContext, useContext, useState, type ReactNode } from 'react';
import { status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { PreviewDevice, StaffRecord } from '@/types/registry/people';

type SessionDirectory = {
    devicesFor: (staffId: string) => PreviewDevice[];
    revoked: (staffId: string, deviceId: string) => boolean;
    revoke: (staffId: string, deviceId: string) => void;
};
const Directory = createContext<SessionDirectory | null>(null);
function useSessions() {
    const directory = useContext(Directory);
    if (!directory) {
        throw new Error('Session directory is required');
    }

    return directory;
}

export function SessionProvider({
    devices,
    staffIds,
    children,
}: {
    devices: PreviewDevice[];
    staffIds: string[];
    children: ReactNode;
}) {
    const [revocations, setRevocations] = useState<Record<string, string[]>>({});
    const devicesFor = (id: string) => (staffIds.includes(id) ? devices : []);
    const revoked = (id: string, deviceId: string) => revocations[id]?.includes(deviceId) ?? false;
    function revoke(id: string, deviceId: string) {
        if (!devicesFor(id).some((d) => d.id === deviceId && !d.current)) {
            return;
        }

        setRevocations((records) => ({ ...records, [id]: [...(records[id] ?? []), deviceId] }));
    }

    return <Directory.Provider value={{ devicesFor, revoked, revoke }}>{children}</Directory.Provider>;
}

export function SessionCount({ staffId }: { staffId: string }) {
    const { devicesFor, revoked } = useSessions();
    return status(`Sessions: ${devicesFor(staffId).filter((device) => !revoked(staffId, device.id)).length}`);
}

export function SessionMonitor({ staff }: { staff: StaffRecord[] }) {
    const [id, select] = useState(staff[0]?.id ?? '');
    return (
        <>
            <label className="block">
                <span className="label">Staff member</span>
                <select className="select block w-full" value={id} onChange={(event) => select(event.target.value)}>
                    {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </label>
            <Sessions staffId={id} />
        </>
    );
}

export function Sessions({ staffId }: { staffId: string }) {
    const { devicesFor, revoked, revoke } = useSessions();
    const devices = devicesFor(staffId);
    return (
        <Card title="Active sessions" subtitle="Revoke any session that should no longer be valid">
            <ul className="divide-y divide-ink-100">
                {devices.map((device) => (
                    <li key={device.id} className="flex items-center justify-between gap-3 py-2">
                        <div>
                            <p className="text-[13px] font-medium text-ink-800">{device.title}</p>
                            <p className="text-xs text-ink-500">{device.detail}</p>
                        </div>
                        {device.current ? (
                            status('Current', 'emerald')
                        ) : revoked(staffId, device.id) ? (
                            status('Revoked')
                        ) : (
                            <Action size="sm" onClick={() => revoke(staffId, device.id)}>
                                Revoke
                            </Action>
                        )}
                    </li>
                ))}
            </ul>
            {!devices.length && <p>No preview sessions recorded.</p>}
        </Card>
    );
}
