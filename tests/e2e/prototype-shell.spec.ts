import { expect, test } from '@playwright/test';

test('the portal uses the prototype canvas, bundled type and responsive rail', async ({ page }, info) => {
    await page.goto('/login');
    await page.locator('[name=email]').fill('ada@demo.example.test');
    await page.locator('[name=password]').fill('password');
    await page.locator('button[type=submit]').press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.evaluate(() => document.fonts.ready);

    const nav = page.getByRole('navigation', { name: 'Primary', exact: true });
    const content = page.locator('#portal-content');
    await expect(content).toBeVisible();
    expect(await page.evaluate(() => document.fonts.check('500 14px Outfit'))).toBe(true);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(245, 247, 249)');
    const bounds = await content.boundingBox();
    expect(bounds).not.toBeNull();
    if (info.project.name === 'desktop') {
        await expect(nav).toBeVisible();
        expect(bounds!.x).toBe(264);
    } else {
        await expect(nav).toBeHidden();
        expect(bounds!.x).toBe(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(info.project.use.viewport!.width);
    await page.screenshot({ path: info.outputPath('dashboard.png') });
    if (info.project.name === 'phone') await page.getByRole('button', { name: 'Menu', exact: true }).press('Enter');
    const install = page.getByRole('button', { name: 'Install as an app' });
    const captured = await page.evaluate(() => !window.dispatchEvent(Object.assign(
        new Event('beforeinstallprompt', { cancelable: true }),
        { prompt: async () => {}, userChoice: Promise.resolve({ outcome: 'dismissed' }) },
    )));
    expect(captured).toBe(true);
    await install.press('Enter');
    await expect(page.getByText('Installation cancelled.', { exact: true })).toBeVisible();
    await install.press('Enter');
    await expect(page.getByText(/choose Install app or Add to Home Screen/)).toBeVisible();
});
