import { expect, test } from '@playwright/test';

test('notification settings explain delivery and link to the signed-in profile', async ({ page }, info) => {
    await page.goto('/community/notification-settings');
    await page.locator('[name=email]').fill('ada@demo.example.test');
    await page.locator('[name=password]').fill('password');
    await page.locator('button[type=submit]').press('Enter');
    await expect(page).toHaveURL(/\/community\/notification-settings$/);
    await expect(page.getByRole('heading', { name: 'Notification settings', exact: true })).toBeVisible();
    const content = page.locator('main').filter({ has: page.getByRole('heading', { name: 'Timing and devices' }) }).last();
    await expect(content.getByText(/queued for ada@demo.example.test/)).toBeVisible();
    await expect(content.getByRole('checkbox')).toHaveCount(0);
    await expect(content.getByRole('button')).toHaveCount(0);
    await expect(content.getByRole('link', { name: 'View institutional sessions' })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath('notification-settings.png'), fullPage: true });
    const profile = content.getByRole('link', { name: 'View my profile' });
    await profile.focus();
    await profile.press('Enter');
    await expect(page).toHaveURL(/\/profile$/);
});
