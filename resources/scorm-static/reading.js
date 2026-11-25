'use strict';
(async () => {
    const api = parent.API;
    const status = document.querySelector('#status');
    const pause = document.querySelector('#pause');
    const finish = document.querySelector('#finish');
    const note = document.querySelector('#note');
    try {
        if (api.LMSInitialize('') !== 'true') throw Error();
        document.querySelector('#lesson').textContent = parent.readingLesson ??
            await (await fetch('lesson.txt', {credentials: 'omit'})).text();
        note.value = api.LMSGetValue('cmi.suspend_data');
        if (api.LMSGetValue('cmi.core.lesson_status') === 'completed') {
            note.readOnly = true;
            status.textContent = 'Already completed.';
            return;
        }
        status.textContent = api.LMSGetValue('cmi.core.entry') === 'resume' ? 'Reading resumed.' : 'Reading ready.';
        pause.disabled = finish.disabled = false;
        async function save(complete) {
            pause.disabled = finish.disabled = note.disabled = true;
            try {
                const values = {
                    'cmi.core.lesson_status': complete ? 'completed' : 'incomplete',
                    'cmi.core.exit': complete ? '' : 'suspend',
                    'cmi.core.score.raw': complete ? '100' : '0',
                    'cmi.suspend_data': note.value,
                };
                for (const [key, value] of Object.entries(values)) {
                    if (api.LMSSetValue(key, value) !== 'true') throw Error();
                }
                if (parent.commitReading) await parent.commitReading();
                if (api.LMSCommit('') !== 'true' || api.LMSFinish('') !== 'true') throw Error();
                status.textContent = complete ? 'Completion saved.' : 'Progress saved. You may close this reading.';
            } catch {
                status.textContent = 'Save not confirmed. Copy your note and relaunch the reading.';
            }
        }
        pause.onclick = () => save(false);
        finish.onclick = () => save(true);
    } catch {
        status.textContent = 'Open this reading through your learning platform.';
    }
})();
