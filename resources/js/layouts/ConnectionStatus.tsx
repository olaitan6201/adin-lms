import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ConnectionState = 'online' | 'offline' | 'reconnected';

const notices: Record<ConnectionState, string> = {
    online: '',
    offline: 'You are offline. Keep this page open. Changes and submissions need a connection.',
    reconnected: 'Connection restored. Check your last save or submission before trying again.',
};

export function ConnectionStatus() {
    const [connection, setConnection] = useState<ConnectionState>(navigator.onLine ? 'online' : 'offline');

    useEffect(() => {
        const disconnected = () => setConnection('offline');
        const reconnected = () => setConnection('reconnected');

        window.addEventListener('offline', disconnected);
        window.addEventListener('online', reconnected);

        return () => {
            window.removeEventListener('offline', disconnected);
            window.removeEventListener('online', reconnected);
        };
    }, []);

    return (
        <div role="status">
            {notices[connection] && <Alert role="presentation"><AlertDescription>{notices[connection]}</AlertDescription></Alert>}
        </div>
    );
}
