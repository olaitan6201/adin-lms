import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

test('an operator can publish an institution identity that a learner sees', async ({ page, browser }, info) => {
    test.setTimeout(90_000);
    const name = `Browser College ${info.project.name}`;
    await page.goto('/login');
    const operator = `brand-${info.project.name}`;
    await page.locator('[name=email]').fill(`${operator}@demo.example.test`);
    await page.getByLabel('Password', { exact: true }).fill('password');
    await page.getByRole('button', { name: /sign in/i }).press('Enter');
    await page.getByLabel('Authenticator code').fill(execFileSync('php', ['-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        join(process.env.PORTAL_E2E_RUN!, `${operator}.factor`)], { encoding: 'utf8' }));
    await page.getByRole('button', { name: /verify code/i }).press('Enter');
    await page.getByRole('link', { name: /^System operations/ }).press('Enter');
    const input = page.getByLabel('Displayed institution name');
    const submit = page.getByRole('button', { name: 'Save institution identity' });
    await input.fill('<invalid>');
    await submit.press('Enter');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('group', { name: 'Check your entries' })).toBeFocused();
    await expect(input).toHaveAccessibleDescription(/Leave blank.*invalid/i);
    await page.screenshot({ path: info.outputPath('branding-correction.png') });
    await input.fill(name);
    await page.getByLabel('Replacement logo').setInputFiles('public/portal-192.png');
    await submit.press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'Institution identity saved.' })).toBeVisible();
    await expect(page.getByRole('link', { name: `${name} home` })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const learner = await browser.newPage({ baseURL: info.project.use.baseURL });
    try {
        await learner.goto('/login');
        await learner.locator('[name=email]').fill('ada@demo.example.test');
        await learner.getByLabel('Password', { exact: true }).fill('password');
        await learner.getByRole('button', { name: /sign in/i }).press('Enter');
        await expect(learner.getByRole('heading', { name: 'My study desk' })).toBeVisible();
        const mark = learner.getByRole('link', { name: `${name} home` }).locator('img');
        await expect(mark).toHaveAttribute('src', /^\/branding\/logo\//);
        await expect.poll(() => mark.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(192);
    } finally {
        await learner.close();
    }
    await input.fill('');
    await page.getByLabel('Restore the configured logo').check();
    await submit.press('Enter');
    await expect(page.getByRole('link', { name: `${name} home` })).toHaveCount(0);
});
