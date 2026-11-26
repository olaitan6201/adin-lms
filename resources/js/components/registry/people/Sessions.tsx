import { useState } from 'react';
import { status } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';

export function Sessions({ devices }: { devices: string[][] }) {
    const [revoked, revoke] = useState(false);

    return (
        <Card title="Active sessions" subtitle="Revoke any session that should no longer be valid">
            <ul className="divide-y divide-ink-100">
                {devices.map(([title, detail], i) => (
                    <li key={title} className="flex items-center justify-between gap-3 py-2">
                        <div>
                            <p className="text-[13px] font-medium text-ink-800">{title}</p>
                            <p className="text-xs text-ink-500">{detail}</p>
                        </div>
                        {i === 0 ? (
                            status('Current', 'emerald')
                        ) : revoked ? (
                            status('Revoked')
                        ) : (
                            <Action size="sm" onClick={() => revoke(true)}>
                                Revoke
                            </Action>
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
}
