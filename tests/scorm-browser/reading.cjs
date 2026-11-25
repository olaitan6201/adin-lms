const {chromium, expect} = require('@playwright/test');
const {execFileSync} = require('node:child_process');
const {strict: assert} = require('node:assert');
const {APP_URL, SCORM_STATIC_ORIGIN: origin, PORTAL_E2E_RUN: run, SCORM_OFFERING} = process.env;
const path = `${APP_URL}/courses/${SCORM_OFFERING}/scorm`;

async function login(page, name) {
    await page.goto(APP_URL + '/login');
    await page.locator('input[name=email]').fill(name + '@demo.example.test');
    await page.locator('input[name=password]').fill('password');
    await page.getByRole('button', {name: /sign in/i}).click();
    if (name === 'lecturer') {
        const otp = execFileSync('php', ['-r',
            'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
            run + '/lecturer.factor'], {encoding: 'utf8'});
        await page.getByLabel('Authenticator code').fill(otp);
        await page.getByRole('button', {name: /verify code/i}).click();
    }
    await page.waitForURL(/\/dashboard$/);
}

(async () => {
    const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/usr/bin/google-chrome'});
    try {
        const teacher = await browser.newPage();
        await login(teacher, 'lecturer');
        await teacher.goto(path);
        await teacher.getByLabel('Reading title').fill('Specimen notes');
        await teacher.getByLabel('Reading v1 ZIP').setInputFiles(run + '/reading.zip');
        await teacher.getByRole('button', {name: 'Import reading'}).click();
        await expect(teacher.getByRole('heading', {name: 'Specimen notes'})).toBeVisible();
        await teacher.close();
        const learner = await browser.newContext({viewport: {width: 390, height: 844}});
        const page = await learner.newPage();
        const requests = [];
        page.on('request', req => { if (req.url().startsWith(origin + '/')) requests.push(req); });
        await login(page, 'ada');
        await page.goto(path);
        const open = () => page.getByRole('button', {name: 'Open reading'}).click();
        const sco = page.frameLocator('iframe').frameLocator('iframe');
        await open();
        await expect(sco.getByText(/Group the specimens/)).toBeVisible();
        // Same-origin synthetic message from the LMS itself must not consume a grant.
        await page.evaluate(() => window.postMessage({type: 'reading-commit', state: {}}, location.origin));
        let claimStatuses;
        await page.route('**/scorm/*/progress', async route => {
            const results = await Promise.all([route.fetch(), route.fetch()]);
            claimStatuses = results.map(r => r.status()).sort();
            await route.fulfill({response: results.find(r => r.status() === 204) || results[0]});
        }, {times: 1});
        await sco.getByLabel('Reading note').fill('Last specimen: blue');
        await sco.getByRole('button', {name: 'Save and pause'}).focus();
        await page.keyboard.press('Enter');
        await expect(page.getByText('Progress recorded.')).toBeVisible();
        await expect(sco.getByText(/Progress saved/)).toBeVisible();
        assert.deepEqual(claimStatuses, [204, 409]);
        await page.goto(path);
        await open();
        await expect(sco.getByText('Reading resumed.')).toBeVisible();
        await expect(sco.getByLabel('Reading note')).toHaveValue('Last specimen: blue');
        // An additional launch supersedes this page. The old page must not acknowledge persistence.
        const other = await page.context().newPage();
        await other.goto(path);
        await other.getByRole('button', {name: 'Open reading'}).click();
        await expect(other.frameLocator('iframe').frameLocator('iframe').getByText('Reading resumed.')).toBeVisible();
        await sco.getByLabel('Reading note').fill('Must not overwrite');
        await sco.getByRole('button', {name: 'Save and pause'}).click();
        await expect(sco.getByText(/Save not confirmed/)).toBeVisible();
        await other.close();
        await page.goto(path);
        await open();
        await expect(sco.getByLabel('Reading note')).toHaveValue('Last specimen: blue');
        await page.setViewportSize({width: 1280, height: 820});
        await sco.getByRole('button', {name: 'Complete reading'}).click();
        await expect(sco.getByText('Completion saved.')).toBeVisible();
        await page.goto(path);
        await open();
        await expect(sco.getByText('Already completed.')).toBeVisible();
        assert.equal(await page.evaluate(() => document.querySelector('iframe').contentDocument), null);
        assert.deepEqual([...new Set(requests.map(r => new URL(r.url()).pathname))].sort(),
            ['/player.html', '/player.js', '/reading.html', '/reading.js']);
        for (const req of requests) {
            const headers = await req.allHeaders();
            assert.ok(!headers.cookie && !headers.authorization && !headers['x-reading-grant']);
            assert.equal((await req.response()).status(), 200);
            assert.equal((await req.response()).headers()['set-cookie'], undefined);
        }
        assert.equal((await page.request.get(origin + '/reading.html', {headers: {Cookie: 'sample=1'}})).status(), 403);
        assert.equal((await page.request.get(origin + '/lesson.txt')).status(), 404);
        assert.equal((await page.request.get(APP_URL + '/reading.js')).status(), 404);
        console.log('PASS: allocated import with MFA, isolated SCO, keyboard pause, persisted resume and completion; static requests cookie-free, no grant headers, no public lesson.');
    } finally {
        await browser.close();
    }
})().catch(err => {console.error(err); process.exitCode = 1;});
