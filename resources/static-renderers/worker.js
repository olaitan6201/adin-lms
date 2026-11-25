// Network-only navigations. Never cache course data, responses, writes or credentials.
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.mode !== 'navigate' || request.method !== 'GET' || new URL(request.url).origin !== self.location.origin)
        return;

    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => new Response(OFFLINE_DOCUMENT, {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })));
});
