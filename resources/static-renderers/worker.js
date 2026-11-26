// Only the production worker imports a release generated from local public build files.
if (self.location.search === '?fixtures') {
    importScripts('/build/fixture-release.js');
}
const release = self.fixtureRelease;
const prefix = 'adin-public-fixtures:';
const cacheName = release && prefix + release.version;
const htmlHeaders = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };

if (release) {
    self.addEventListener('install', event => {
        // addAll commits atomically. A missing, redirected or nonmatching file fails installation.
        const requests = Object.entries(release.files).map(([url, integrity]) =>
            new Request(url, { credentials: 'omit', redirect: 'error', cache: 'no-store', integrity }));
        event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(requests)));
    });
}

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
        }
        await self.clients.claim();
    })());
});

function fixtureDocument(path) {
    const { component, screen } = release.pages[path];
    // All interpolations are build-owned constants, never request props, query or cookies.
    const page = {
        component, url: path, version: release.version, flash: {}, rescuedProps: [],
        props: { screenKey: screen, branding: null, signedIn: false, portalIdentity: null, academicLinks: [], errors: {} },
    };
    const styles = release.styles.map(file => `<link rel="stylesheet" href="${file}">`).join('');
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>AdinOpen LMS</title>
<link rel="manifest" href="/workspace.webmanifest"><link rel="icon" href="/brand/adin/crest.svg">
${styles}<script type="module" src="${release.entry}"></script></head><body>
<script data-page="app" type="application/json">${JSON.stringify(page)}</script><div id="app"></div>
</body></html>`, { headers: {
        ...htmlHeaders,
        'Content-Security-Policy': "script-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none'",
        'Referrer-Policy': 'no-referrer',
    } });
}

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;
    if (url.username || url.password) return;
    const path = url.pathname + url.search;
    const fixture = release && Object.hasOwn(release.pages, path);
    const navigation = request.mode === 'navigate';
    if (release && Object.hasOwn(release.files, path)) {
        event.respondWith(caches.open(cacheName).then(async cache => await cache.match(url.href) ?? fetch(url, {
            credentials: 'omit', redirect: 'error', cache: 'no-store', integrity: release.files[path],
        })));
    } else if (navigation || (fixture && request.headers.get('X-Inertia') === 'true')) {
        event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => {
            if (!fixture) return new Response(OFFLINE_DOCUMENT, { status: 503, headers: htmlHeaders });
            if (navigation) return fixtureDocument(path);
            // Restart as a clean document instead of merging with a live session's page props.
            return new Response(null, { status: 409, headers: {
                'X-Inertia-Location': path, 'Cache-Control': 'no-store',
            } });
        }));
    } else {
        event.respondWith(fetch(request, { cache: 'no-store' }));
    }
});
