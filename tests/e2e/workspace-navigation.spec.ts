import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';

type WorkspaceRoute = { uri: string; name: string };

test('the public workspace links to real sign-in and email recovery', async ({ page }, info) => {
    await page.goto('/admin/reports');
    if (info.project.name === 'phone') {
        await page.getByRole('button', { name: 'Open navigation' }).click();
    }

    const signIn = page.getByRole('link', { name: 'Sign in', exact: true });
    await expect(signIn).toHaveAttribute('href', '/login');
    await signIn.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Sign in to your learning record' })).toBeVisible();
    await page.getByRole('link', { name: 'Forgot your password?' }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible();
});

test('each role menu links to its Laravel workspace routes', async ({ page }, info) => {
    const routes: WorkspaceRoute[] = JSON.parse(execFileSync('php', [
        'artisan', 'route:list', '--name=workspace.', '--json', '--no-interaction',
    ], { encoding: 'utf8' }));

    for (const [role, home] of Object.entries({
        admin: 'reports', lecturer: 'overview', student: 'overview', guardian: 'progress',
    })) {
        await page.goto(`/${role}/${home}`);
        if (info.project.name === 'phone') {
            await page.getByRole('button', { name: 'Open navigation' }).click();
        }

        const navigation = page.getByRole('navigation', { name: 'Module navigation' });
        await expect(navigation.locator('a[aria-current="page"]')).toHaveAttribute('href', `/${role}/${home}`);
        const hrefs = await navigation.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')));
        const expected = routes.filter(route => route.name.startsWith(`workspace.${role}.`)).map(route => `/${route.uri}`);
        expect(hrefs.sort(), `${role} menu`).toEqual(expected.sort());
    }
});

for (const [label, path, component, screenKey, live] of [
    ['QA and compliance', '/admin/qa-review', 'Admin/Qa', 'admin/qa', '/admin/qa'],
    ['Offline downloads', '/student/offline-downloads', 'Student/Downloads', 'student/downloads', '/student/downloads'],
    ['Approved progress', '/guardian/progress', 'Guardian/ApprovedProgress', 'guardian/progress', '/guardian'],
]) {
    test(`search opens the ${label} fixture and the live route still requires login`, async ({ page }) => {
        await page.goto('/admin/reports');
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.getByRole('textbox', { name: 'Search screens' }).fill(label);
        const link = page.getByRole('dialog').getByRole('link', { name: new RegExp(label) });
        await expect(link).toHaveAttribute('href', path);
        const visit = page.waitForResponse(response => new URL(response.url()).pathname === path &&
            response.request().headers()['x-inertia'] === 'true');
        await link.click();
        expect(await (await visit).json()).toMatchObject({ component, props: { screenKey, signedIn: false } });
        await expect(page).toHaveURL(url => url.pathname === path);
        await page.goto(live);
        await expect(page).toHaveURL(/\/login$/);
    });
}

test.describe('narrow workspace', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('open navigation owns the shortcut until the sheet closes', async ({ page }) => {
        await page.goto('/admin/reports');
        const menu = page.getByRole('button', { name: 'Open navigation' });
        await menu.click();
        const sheet = page.getByRole('dialog', { name: 'Module navigation' });
        const close = sheet.getByRole('button', { name: 'Close navigation' });
        await close.focus();
        await page.keyboard.press('Meta+k');
        await expect(close).toBeFocused();
        await expect(page.getByPlaceholder('Search screens, courses, students...')).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(menu).toBeFocused();
        await page.keyboard.press('Meta+k');
        await expect(page.getByRole('textbox', { name: 'Search screens' })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeFocused();
    });
});
