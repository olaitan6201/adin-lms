import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

test('a guest can reach sign-in by keyboard at either navigation width', async ({ page }, info) => {
    await page.goto('/portal');
    await page.getByRole('link', { name: /sign in to the portal/i }).waitFor();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#portal-content')).toBeFocused();

    const navigation = page.getByRole('navigation', { name: 'Primary' });

    if (info.project.name === 'phone') {
        const menu = page.getByRole('button', { name: 'Menu', exact: true });
        await expect(navigation).toBeHidden();
        await menu.focus();
        await page.keyboard.press('Enter');
        await expect(navigation).toBeVisible();
        await expect(page.getByRole('dialog', { name: 'Portal menu' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();
        await navigation.getByRole('link', { name: 'Sign in', exact: true }).focus();
        await page.keyboard.press('Escape');
        await expect(navigation).toBeHidden();
        await expect(menu).toBeFocused();
        await page.keyboard.press('Enter');
    } else {
        const sidebar = await navigation.boundingBox();
        const content = await page.locator('#portal-content').boundingBox();
        expect(sidebar && content && sidebar.x + sidebar.width <= content.x + 1).toBe(true);
    }

    await navigation.getByRole('link', { name: 'Sign in', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.locator('#portal-content')).toBeFocused();
});

test('the account forms reflow at narrow widths and preserve sign-in error recovery', async ({ page }, info) => {
    if (info.project.name === 'phone') {
        await page.setViewportSize({ width: 320, height: 720 });
    }

    for (const [path, heading] of [
        ['/login', 'Sign in to your learning record'],
        ['/forgot-password', 'Forgot your password?'],
        ['/reset-password/example-token', 'Set your password'],
    ]) {
        await page.goto(path);
        await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Return to the learning portal' })).toHaveCount(0);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        const button = await page.locator('form button[type="submit"]').boundingBox();
        expect(button?.height ?? 0).toBeGreaterThanOrEqual(44);
        const field = page.locator('form input:not([type="hidden"])').first();
        const fieldBox = await field.boundingBox();
        expect(fieldBox?.height ?? 0).toBeGreaterThanOrEqual(44);
        await expect(field).toHaveCSS('border-top-color', 'rgb(122, 140, 160)');
    }

    await page.goto('/login');
    const identifier = page.getByLabel('Email, matric number or staff ID');
    const password = page.getByLabel('Password', { exact: true });
    const submit = page.getByRole('button', { name: 'Sign in', exact: true });
    for (const [palette, color] of [['navy', 'rgb(25, 56, 91)'], ['teal', 'rgb(19, 78, 74)']]) {
        await page.evaluate(value => { document.body.dataset.palette = value; }, palette);
        await expect(submit).toHaveCSS('background-color', color);
    }
    await identifier.fill('unknown-account@example.test');
    await password.fill('invalid-password');
    await submit.click();
    await expect(identifier).toHaveAttribute('aria-invalid', 'true');
    await expect(identifier).toBeFocused();
    await expect(identifier).toHaveValue('unknown-account@example.test');
    await expect(password).toHaveValue('');
});

test('offline navigation never replays a submission or displays a cached private page', async ({ page, context }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('ada@demo.example.test');
    await page.locator('input[name="password"]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('heading', { name: 'My study desk' })).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    await context.setOffline(true);
    const offline = await page.reload();
    expect(offline?.status()).toBe(503);
    await expect(page.getByRole('heading', { name: 'Connection unavailable' })).toBeVisible();
    await expect(page.getByText('Computing reflection')).toHaveCount(0);
    const files = await page.evaluate(async () => {
        const entries: [string, string][] = [];
        for (const name of await caches.keys()) {
            const cache = await caches.open(name);
            for (const key of await cache.keys()) {
                const response = await cache.match(key);
                const digest = await crypto.subtle.digest('SHA-256', await response!.arrayBuffer());
                entries.push([key.url, Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('')]);
            }
        }
        return entries;
    });
    for (const [url, digest] of files) {
        const { pathname, search, origin } = new URL(url);
        expect(origin).toBe(new URL(page.url()).origin);
        expect(search).toBe('');
        expect(pathname).toMatch(/^\/(?:build\/assets\/[\w.-]+\.(?:js|css|woff2|pdf|docx|xlsx|pptx|zip)|brand\/adin\/crest\.svg|workspace\.webmanifest|(?:portal-[\w-]+|apple-touch-icon)\.png)$/);
        const bytes = await readFile(join(process.env.PORTAL_E2E_RUN!, 'public', pathname));
        expect(digest, pathname).toBe(createHash('sha256').update(bytes).digest('hex'));
    }

    await context.setOffline(false);
    await page.getByRole('link', { name: /reconnect/i }).click();
    await expect(page.getByRole('heading', { name: 'My study desk' })).toBeVisible();
    const privateUrl = page.url();
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.waitForURL(url => url.href !== privateUrl);
    await page.goto(privateUrl);
    await expect(page).toHaveURL(/\/login$/);
    await context.setOffline(true);
    expect((await page.goto(privateUrl))?.status()).toBe(503);
    await expect(page.getByRole('heading', { name: 'Connection unavailable' })).toBeVisible();
});

test('registry actions respect reduced motion without changing their stock source', async ({ page }) => {
    await page.goto('/login');
    const submit = page.getByRole('button', { name: 'Sign in', exact: true });
    await expect(submit).toHaveAttribute('data-slot', 'button');
    const transition = () => submit.evaluate(el => getComputedStyle(el).transitionProperty);
    expect(await transition()).not.toBe('all');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(transition).toBe('none');
});
