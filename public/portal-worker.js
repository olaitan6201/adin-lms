// Network-only navigations. No course data, responses, writes or credentials enter Cache Storage.
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.mode !== 'navigate' || request.method !== 'GET' || new URL(request.url).origin !== self.location.origin)
        return;

    event.respondWith(
        fetch(request, { cache: 'no-store' }).catch(
            () =>
                new Response(
                    '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
                        '<title>Connection unavailable · Learning portal</title><main><h1>Connection unavailable</h1>' +
                        '<p>Reconnect to open the learning portal. Check your last save or submission when you return.</p>' +
                        '<a href="/dashboard">Reconnect to dashboard</a></main></html>',
                    {
                        status: 503,
                        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
                    },
                ),
        ),
    );
});
