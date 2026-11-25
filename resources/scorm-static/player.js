'use strict';
(() => {
    const origin = decodeURIComponent(location.hash.slice(1));
    if (!origin || parent === window || new URL(origin).origin !== origin) return;

    let opened = false;
    let pending;
    window.addEventListener('message', (event) => {
        if (event.source !== parent || event.origin !== origin) return;

        if (event.data?.type === 'reading-result' && pending) {
            pending(event.data.saved === true);
            pending = undefined;
            return;
        }

        if (event.data?.type !== 'reading-open' || opened) return;

        opened = true;
        const state = Object.assign(Object.create(null), event.data.state);
        const entry =
            state['cmi.core.exit'] === 'suspend'
                ? 'resume'
                : state['cmi.core.lesson_status'] === 'not attempted'
                  ? 'ab-initio'
                  : '';
        let active = false;
        let confirmed = false;
        let finished = false;
        window.readingLesson = event.data.lesson;
        window.API = Object.freeze({
            LMSInitialize: (arg) => {
                if (arg !== '' || active || finished) return 'false';

                active = true;
                return 'true';
            },
            LMSGetValue: (key) => (active ? (key === 'cmi.core.entry' ? entry : (state[key] ?? '')) : ''),
            LMSSetValue: (key, value) => {
                if (!active || confirmed || pending || !Object.hasOwn(state, key) || typeof value !== 'string')
                    return 'false';

                state[key] = value;
                return 'true';
            },
            LMSCommit: (arg) => (arg === '' && active && confirmed ? 'true' : 'false'),
            LMSFinish: (arg) => {
                if (arg !== '' || !active || !confirmed) return 'false';

                active = false;
                finished = true;
                return 'true';
            },
        });
        window.commitReading = async () => {
            if (!active || pending || confirmed) throw Error();

            confirmed = await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    pending = undefined;
                    resolve(false);
                }, 15000);
                pending = (result) => {
                    clearTimeout(timeout);
                    resolve(result);
                };
                parent.postMessage({ type: 'reading-commit', state }, origin);
            });
            if (!confirmed) throw Error();
        };
        const frame = document.createElement('iframe');
        frame.title = 'Reading exercise';
        frame.width = '95%';
        frame.height = '420';
        frame.src = 'reading.html';
        document.querySelector('#player').append(frame);
    });
    parent.postMessage('reading-ready', origin);
})();
