import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { PortalLayout } from './layouts/PortalLayout';
import RoleShell from './app/RoleShell';

const pages = import.meta.glob<ComponentType>('./pages/**/*.tsx', { import: 'default' });

void createInertiaApp({
    layout: (_, page) => typeof page.props.screenKey === 'string' ? RoleShell : PortalLayout,
    resolve: (name) => resolvePageComponent<ComponentType>(`./pages/${name}.tsx`, pages),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});

if ('serviceWorker' in navigator && window.isSecureContext) {
    void navigator.serviceWorker.register('/portal-worker.js').catch(() => {
        // The online portal remains usable when installation is unavailable.
    });
}
