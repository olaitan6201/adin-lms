import { expect, test } from '@playwright/test';

test('a guest can reach sign-in by keyboard at either navigation width', async ({ page }, info) => {
    await page.goto('/');
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
        await navigation.getByRole('link', { name: 'Sign in', exact: true }).focus();
        await page.keyboard.press('Escape');
        await expect(navigation).toBeHidden();
        await expect(menu).toBeFocused();
        await page.keyboard.press('Enter');
    }

    await navigation.getByRole('link', { name: 'Sign in', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.locator('#portal-content')).toBeFocused();
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
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Connection unavailable' })).toBeVisible();
    await expect(page.getByText('Computing reflection')).toHaveCount(0);
    expect(await page.evaluate(() => caches.keys())).toEqual([]);

    await context.setOffline(false);
    await page.getByRole('link', { name: /reconnect/i }).click();
    await expect(page.getByRole('heading', { name: 'My study desk' })).toBeVisible();
});
