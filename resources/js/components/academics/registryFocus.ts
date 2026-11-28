export function focusRegistryTarget(id: string, fallbackId?: string) {
    const fallback = fallbackId ? document.getElementById(fallbackId) : null;
    const preferred = document.getElementById(id);
    const target = preferred && !preferred.matches(':disabled') ? preferred : fallback;

    if (target) {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
}

export function focusAfterRegistryNavigation(id: string, fallbackId?: string) {
    requestAnimationFrame(() => focusRegistryTarget(id, fallbackId));
}
