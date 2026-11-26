import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';

function nextCode(course: string) {
    const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
    return `${course}-${suffix}`;
}

interface VerificationProps {
    course: string;
    codeSuffix: string;
}

export function SessionVerification({ course, codeSuffix }: VerificationProps) {
    const [code, setCode] = useState(`${course}-${codeSuffix}`);

    useEffect(() => {
        const interval = window.setInterval(() => setCode(nextCode(course)), 60_000);
        return () => window.clearInterval(interval);
    }, [course]);

    return (
        <Card title="Controlled verification" subtitle="Optional QR check-in for the session">
            <div className="mb-3 flex items-center gap-4">
                <span className="rounded-xl bg-ink-900 p-4 text-white">
                    <Icon name="qr" className="size-10" />
                </span>
                <div>
                    <p className="text-sm font-medium">
                        Session code <output>{code}</output>
                    </p>
                    <p className="my-2 text-sm text-ink-500">
                        Refreshes every 60 seconds. A scan records the time and the device, and marks the
                        student present.
                    </p>
                </div>
            </div>
            <Action size="sm" onClick={() => setCode(nextCode(course))}>
                Refresh code
            </Action>
        </Card>
    );
}
