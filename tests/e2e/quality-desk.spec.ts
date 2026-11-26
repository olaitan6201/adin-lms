import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { loginWithPassword } from './exam-fixture';

test('QA can inspect an approved version from its mapping evidence with the keyboard', async ({ page }, info) => {
    const identity = `quality-desk-${info.project.name}`;
    await loginWithPassword(page, identity);
    const factor = join(process.env.PORTAL_E2E_RUN!, `${identity}.factor`);
    const otp = execFileSync('php', ['-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        factor], { encoding: 'utf8' });
    await page.getByLabel('Authenticator code').fill(otp);
    await page.getByLabel('Authenticator code').press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto('/admin/qa');
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { name: 'QA and compliance' })).toBeVisible();
    await expect(main.getByText('No reviewed versions are awaiting approval.')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath('quality-desk.png'), fullPage: true });
    const evidence = main.getByRole('region', { name: 'Approved curriculum evidence' });
    await evidence.focus();
    await page.keyboard.press('Tab');
    const version = evidence.getByRole('link', { name: 'BSc Computing · v1' });
    await expect(version).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(main.getByRole('heading', { name: 'Outcome coverage' })).toBeVisible();
});
