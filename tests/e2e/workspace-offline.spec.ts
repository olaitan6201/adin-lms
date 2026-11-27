import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

test('installed public fixtures render offline and private namespaces stay network-only', async ({ page, context }) => {
    test.setTimeout(90000);
    const routes: { uri: string; name: string }[] = JSON.parse(execFileSync('php', [
        'artisan', 'route:list', '--name=workspace.', '--json', '--no-interaction',
    ], { encoding: 'utf8' }));
    expect(routes).toHaveLength(40);
    await page.goto('/admin/reports');
    const heading = page.getByRole('main').getByRole('heading', { name: 'Reports and analytics', exact: true });
    await expect(heading).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    expect((await page.reload())?.status()).toBe(200);
    await expect(heading).toBeVisible();
    const { start_url: startUrl } = JSON.parse(await readFile('public/workspace.webmanifest', 'utf8'));
    expect((await page.goto(startUrl))?.status()).toBe(200);
    await expect(heading).toBeVisible();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of routes) {
        expect((await page.goto(`/${route.uri}`))?.status(), route.name).toBe(200);
        await expect(page.locator('main h1').first(), route.name).toBeVisible();
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
    expect(await page.evaluate(() => fetch('/admin/overview', { method: 'POST' }).then(() => false, () => true))).toBe(true);
    expect(await page.evaluate(() => fetch('/api/me').then(() => false, () => true))).toBe(true);
    for (const path of ['/dashboard', '/admin/overview', '/admin/structure', '/admin/qa', '/student/downloads', '/login', '/forgot-password', '/auth/signin', '/auth/recover',
        '/student/course?course=CHM401', '/student/course?course=MTH112&extra=1']) {
        expect((await page.goto(path))?.status(), path).toBe(503);
        await expect(page.getByRole('heading', { name: 'Connection unavailable' })).toBeVisible();
    }
    expect(errors).toEqual([]);
});
