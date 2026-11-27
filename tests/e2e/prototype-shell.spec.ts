import { expect, test } from '@playwright/test';

function contrast(color: string, background: number[]): number {
    function luminance(channels: number[]): number {
        const weights = [0.2126, 0.7152, 0.0722];
        return channels.reduce((sum, channel, index) => {
            const scaled = channel / 255;
            const linear = scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;

            return sum + weights[index] * linear;
        }, 0);
    }

    const foreground = color.match(/\d+/g)?.map(Number) ?? [];
    expect(foreground).toHaveLength(3);

    const luminances = [luminance(foreground), luminance(background)];

    return (Math.max(...luminances) + 0.05) / (Math.min(...luminances) + 0.05);
}

test('the portal uses the prototype canvas, bundled type and responsive rail', async ({ page }, info) => {
    await page.goto('/login');
    await page.locator('[name=email]').fill('ada@demo.example.test');
    await page.locator('[name=password]').fill('password');
    await page.locator('button[type=submit]').press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.evaluate(() => document.fonts.ready);

    const nav = page.getByRole('navigation', { name: 'Primary', exact: true });
    const content = page.locator('#portal-content');
    await expect(page.locator('.workspace-shell')).toHaveCount(1);
    const institution = page.locator('.workspace-shell header p').first();
    const institutionColor = await institution.evaluate(element => getComputedStyle(element).color);
    expect(contrast(institutionColor, [245, 247, 249])).toBeGreaterThanOrEqual(4.5);
    await expect(page.getByRole('button', { name: /switch fixture role/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Profile: / })).toBeVisible();
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search screens' }).fill('Dashboard');
    await expect(page.getByRole('dialog').getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/dashboard');
    const instructions = page.getByText('Enter to open · Up and Down to move', { exact: true });
    const instructionsColor = await instructions.evaluate(element => getComputedStyle(element).color);
    expect(contrast(instructionsColor, [245, 247, 249])).toBeGreaterThanOrEqual(4.5);
    await expect(page.getByText('Prototype navigation')).toHaveCount(0);
    await page.keyboard.press('Escape');
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
    if (info.project.name === 'phone') {
        await page.getByRole('button', { name: 'Menu', exact: true }).press('Enter');
    }
    const section = nav.locator('.rail-section').first();
    const sectionColor = await section.evaluate(element => getComputedStyle(element).color);
    expect(contrast(sectionColor, [15, 26, 42])).toBeGreaterThanOrEqual(4.5);
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
