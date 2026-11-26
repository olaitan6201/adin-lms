import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

test('installed public fixtures render offline and private namespaces stay network-only', async ({ page, context }) => {
    test.setTimeout(90000);
    const routes: { uri: string; name: string }[] = JSON.parse(execFileSync('php', [
        'artisan', 'route:list', '--name=workspace.', '--json', '--no-interaction',
    ], { encoding: 'utf8' }));
    expect(routes).toHaveLength(44);
    await page.goto('/admin/overview');
    const heading = page.getByRole('heading', { name: 'Institution overview', exact: true });
    await expect(heading).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    expect((await page.reload())?.status()).toBe(200);
    await expect(heading).toBeVisible();
    await page.locator('main a[href="/admin/reports"]').first().click();
    await expect(page).toHaveURL(/\/admin\/reports$/);
    await expect(page.locator('main h1')).toBeVisible();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of routes) {
        expect((await page.goto(`/${route.uri}`))?.status(), route.name).toBe(200);
        await expect(page.locator(route.uri.startsWith('auth/') ? 'section h2' : 'main h1').first(), route.name).toBeVisible();
        const props = await page.locator('script[data-page="app"]').textContent();
        expect(JSON.parse(props!).props).toEqual({
            screenKey: route.name.split('.').slice(1).join('/'), branding: null,
            signedIn: false, portalIdentity: null, academicLinks: [], errors: {},
        });
    }
    for (const [role, code, title] of [
        ['student', 'MTH112', 'Calculus I'], ['lecturer', 'CHM401', 'Physical Chemistry II'],
    ]) {
        await page.goto(`/${role}/courses`);
        await page.locator(`main a[href="/${role}/course?course=${code}"]`).click();
        await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
    await page.goto('/student/offline-downloads');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download DOCX' }).click();
    const downloadedPath = await (await download).path();
    const sample = await readFile('resources/js/data/learning/materials/acc302-practice-set.docx');
    expect(await readFile(downloadedPath!)).toEqual(sample);
    await page.goto('/auth/signin');
    await page.locator('input[type=password]').fill('offline-fixture-marker');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByText(/Sign-in submitted\./).last().waitFor();
    await page.getByRole('link', { name: 'Forgotten your password?' }).click();
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
    await page.goto('/auth/signin');
    await expect(page.locator('input[type=password]')).toHaveValue('');
    expect(await page.evaluate(() => fetch('/admin/overview', { method: 'POST' }).then(() => false, () => true))).toBe(true);
    expect(await page.evaluate(() => fetch('/api/me').then(() => false, () => true))).toBe(true);
    for (const path of ['/dashboard', '/admin/qa', '/student/downloads', '/login', '/auth/signin?code=fixture',
        '/student/course?course=CHM401', '/student/course?course=MTH112&extra=1']) {
        expect((await page.goto(path))?.status(), path).toBe(503);
        await expect(page.getByRole('heading', { name: 'Connection unavailable' })).toBeVisible();
    }
    expect(errors).toEqual([]);
});
