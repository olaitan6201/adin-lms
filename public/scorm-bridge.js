'use strict';
(() => {
    const { origin, endpoint, reading, csrf } = document.querySelector('main').dataset;
    const { grant, lesson, state } = JSON.parse(reading);
    const frame = document.querySelector('iframe');
    const notice = document.querySelector('#notice');
    let initialized = false;
    let used = false;
    setTimeout(() => {
        if (!initialized) notice.textContent = 'The isolated player could not open. Return to readings and try again.';
    }, 15000);
    window.addEventListener('message', async (event) => {
        if (event.source !== frame.contentWindow || event.origin !== origin) return;

        const send = (message) => frame.contentWindow.postMessage(message, origin);
        if (event.data === 'reading-ready' && !initialized) {
            initialized = true;
            send({ type: 'reading-open', lesson, state });
            notice.textContent = 'Save or complete the reading before leaving this page.';
            return;
        }

        if (!initialized || used || event.data?.type !== 'reading-commit') return;

        used = true;
        try {
            const body = JSON.stringify(event.data.state);
            if (body.length > 32768) throw Error();

            const bytes = new TextEncoder();
            const key = await crypto.subtle.importKey(
                'raw',
                bytes.encode(grant),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign'],
            );
            const digest = await crypto.subtle.sign('HMAC', key, bytes.encode(body));
            const signature = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                redirect: 'error',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Reading-Grant': grant,
                    'X-Reading-Signature': signature,
                },
            });
            if (response.status !== 204) throw Error();

            send({ type: 'reading-result', saved: true });
            notice.textContent = 'Progress recorded.';
        } catch {
            send({ type: 'reading-result', saved: false });
            notice.textContent = 'Save not confirmed. Copy your note and reopen the reading.';
        }
    });
    frame.src = origin + '/player.html#' + encodeURIComponent(location.origin);
})();
