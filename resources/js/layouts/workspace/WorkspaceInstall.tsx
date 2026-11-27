import { Icon } from '@/components/icons/Icon';
import { useSyncExternalStore } from 'react';
import { useWorkspaceOverlays } from './WorkspaceOverlays';

type InstallOffer = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>
};
let pending: InstallOffer | null = null;
const listeners = new Set<() => void>();
function update(offer: InstallOffer | null) {
    pending = offer;
    listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        update(event as InstallOffer);
    });
    window.addEventListener('appinstalled', () => update(null));
}

export function WorkspaceInstall({ inPage = false }: { inPage?: boolean }) {
    const offer = useSyncExternalStore(
        subscribe,
        () => pending,
        () => null,
    );
    const { notify } = useWorkspaceOverlays();
    async function install() {
        if (offer) {
            update(null);
            try {
                await offer.prompt();
                const { outcome } = await offer.userChoice;
                notify(outcome === 'accepted' ? 'Installation requested.' : 'Installation cancelled.');
                return;
            } catch {
                /* An install prompt can expire. */
            }
        }

        notify('Open your browser menu and choose Install app or Add to Home Screen, if available.');
    }

    return (
        <button
            type="button"
            onClick={() => void install()}
            className={inPage ? 'btn btn-outline' : undefined}
        >
            <Icon name={inPage ? 'smartphone' : 'download'} className="size-4" />
            {inPage ? <span>Install app</span> : offer ? 'Install as an app' : 'Install this prototype as an app'}
        </button>
    );
}
