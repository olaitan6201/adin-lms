import { Download } from 'lucide-react';
import { useId, useState } from 'react';

type InstallPrompt = Event & {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Capture the one-shot browser offer even if the mobile rail is closed.
let offer: InstallPrompt | null = null;
if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        offer = event as InstallPrompt;
    });
    window.addEventListener('appinstalled', () => {
        offer = null;
    });
}

export function InstallPortal() {
    const id = useId();
    const [message, setMessage] = useState('');
    async function install() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setMessage('You are using the installed portal.');
            return;
        }

        const pending = offer;
        offer = null;
        if (pending) {
            try {
                await pending.prompt();
                const choice = await pending.userChoice;
                setMessage(choice.outcome === 'accepted' ? 'Installation requested.' : 'Installation cancelled.');
                return;
            } catch {
                // Some browsers invalidate the offer before a user opens the rail.
            }
        }

        setMessage('Open your browser menu and choose Install app or Add to Home Screen, if available.');
    }

    return (
        <>
            <button type="button" onClick={() => void install()} aria-describedby={message ? id : undefined}>
                <Download size={16} aria-hidden="true" />
                Install as an app
            </button>
            <p id={id} role="status" className="text-xs empty:hidden">
                {message}
            </p>
        </>
    );
}
