import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { resolvePortalLayout } from './app/resolvePortalLayout';

const pages = import.meta.glob<ComponentType>('./pages/**/*.tsx', { import: 'default' });

void createInertiaApp({
    layout: resolvePortalLayout,
    resolve: name => resolvePageComponent<ComponentType>(`./pages/${name}.tsx`, pages),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});

if ('serviceWorker' in navigator && window.isSecureContext) {
    const worker = import.meta.env.PROD ? '/portal-worker.js?fixtures' : '/portal-worker.js';
    void navigator.serviceWorker.register(worker, { updateViaCache: 'none' }).catch(() => {
        // The online portal remains usable when installation is unavailable.
    });
}
