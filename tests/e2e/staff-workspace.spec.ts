import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

function fixtureCode(role: 'lecturer' | 'officer'): string {
    const run = process.env.PORTAL_E2E_RUN;

    if (!run) {
        throw new Error('Missing browser fixture directory.');
    }

    return execFileSync(
        'php',
        [
            '-r',
            'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
            join(run, `${role}.factor`),
        ],
        { encoding: 'utf8' },
    );
}

test('staff sign-in requires MFA and opens the appropriate workspace', async ({ page }, info) => {
    const role = info.project.name === 'desktop' ? 'lecturer' : 'officer';
    const expectedHeading = role === 'lecturer' ? 'Teaching desk' : 'Institution overview';

    await page.goto('/login');
    await page.locator('input[name="email"]').fill(`${role}@demo.example.test`);
    await page.locator('input[name="password"]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/security\/challenge$/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/security\/challenge$/);
    await expect(page.locator('.workspace-shell')).toHaveCount(0);
    await page.getByLabel('Authenticator code').fill(fixtureCode(role));
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(role === 'officer' ? /\/admin\/overview$/ : /\/dashboard$/);
    await expect(page.getByRole('heading', { name: expectedHeading, exact: true })).toBeVisible();
    if (role === 'officer') {
        await expect(page.locator('nav a[href="/admin/overview"]')).toHaveAttribute('aria-current', 'page');
        const readiness = page.locator('main section').filter({
            has: page.getByRole('heading', { name: 'Examination readiness' }),
        });
        await expect(readiness.getByText('Examination management access is required.')).toBeVisible();
        await expect(readiness.getByText('Bank coverage')).toHaveCount(0);
    }
    await expect(page.locator('.workspace-shell')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);

    await page.reload();
    await expect(page.getByRole('heading', { name: expectedHeading, exact: true })).toBeVisible();
});
