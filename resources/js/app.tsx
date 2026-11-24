import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const pages = import.meta.glob<ComponentType>('./pages/**/*.tsx', { import: 'default' });

void createInertiaApp({
    resolve: (name) => resolvePageComponent<ComponentType>(`./pages/${name}.tsx`, pages),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
