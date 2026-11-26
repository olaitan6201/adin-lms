import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Table } from '@/components/ui/data-display/Table';
import type { NotificationPreferences } from '@/types/community/notifications';

type DevicesProps = Pick<NotificationPreferences, 'devices'> & { onRevoke: () => void };

export function SignedInDevices({ devices, onRevoke }: DevicesProps) {
    const [revoked, setRevoked] = useState(false);
    const visibleDevices = revoked ? devices.filter((device) => device.current) : devices;

    function revokeOtherDevices() {
        setRevoked(true);
        onRevoke();
    }

    return (
        <Card
            title="Devices signed in to your account"
            subtitle="Revoke any device you no longer use"
            actions={
                !revoked && (
                    <Action size="sm" icon="logout" onClick={revokeOtherDevices}>
                        Sign out other devices
                    </Action>
                )
            }
        >
            <Table
                columns={['Device', 'Last seen from', 'Last activity', 'State']}
                rows={visibleDevices.map(({ device, location, last, state, current }) => [
                    <span key="device" className="flex items-center gap-2">
                        <Icon name="monitor" className="size-4 text-ink-400" />
                        <span className="text-[13px] font-medium text-ink-800">{device}</span>
                    </span>,
                    <span key="location" className="text-[12.5px] text-ink-600">
                        {location}
                    </span>,
                    <span key="last" className="text-[12.5px] text-ink-600">
                        {last}
                    </span>,
                    <Badge key="state" tone={current ? 'emerald' : 'slate'}>
                        {state}
                    </Badge>,
                ])}
            />
        </Card>
    );
}
