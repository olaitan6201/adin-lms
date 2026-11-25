import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { dashboardWeek } from './dashboard-fixture';

let restore: (() => void) | undefined;
test.beforeAll(() => { restore = dashboardWeek(); });
test.afterAll(() => restore?.());

for (const role of ['ada', 'officer', 'lecturer']) {
    test(`${role} can read the dashboard and use its role-specific details`, async ({ page }, info) => {
        await page.goto('/login');
        await page.locator('[name=email]').fill(`${role}@demo.example.test`);
        await page.locator('[name=password]').fill('password');
        await page.locator('[name=password]').press('Enter');
        if (role !== 'ada') {
            const code = execFileSync('php', ['-r',
                'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
                join(process.env.PORTAL_E2E_RUN!, `${role}.factor`)], { encoding: 'utf8' });
            await page.getByLabel('Authenticator code').fill(code);
            await page.getByRole('button', { name: /verify code/i }).press('Enter');
        }
        await expect(page).toHaveURL(/dashboard$/);
        if (role === 'officer') {
            await expect(page.getByText('Accounts with accepted credentials')).toBeVisible();
            await expect(page.getByText('Morning paper', { exact: true })).toBeVisible();
            await expect(page.getByText('Assignment revision received', { exact: false })).toBeVisible();
            await page.screenshot({ path: `.agent-work/usage-${info.project.name}.png`, fullPage: true });
            const select = page.getByRole('combobox', { name: 'Academic period' });
            for (const [semester, drafts] of [[1, 0], [2, 1]]) {
                const option = select.getByRole('option', { name: new RegExp(`Semester ${semester}$`) });
                await select.selectOption((await option.getAttribute('value'))!);
                await page.getByRole('button', { name: 'Apply period' }).press('Enter');
                await expect(page).toHaveURL(/dashboard\?term=/);
                await expect(page.getByText('Draft offering', { exact: true })).toHaveCount(drafts);
            }
        } else if (role === 'lecturer') {
            await expect(page.getByRole('heading', { name: 'Upcoming examinations' })).toBeVisible();
            await expect(page.getByRole('link', { name: 'Scheduled writing paper' })).toBeVisible();
            await page.getByText('Roster and recent uploads').press('Enter');
            await expect(page.getByRole('heading', { name: 'My recent file uploads' })).toBeVisible();
            await expect(page.getByText('Enrolled students', { exact: true })).toBeVisible();
        } else {
            await expect(page.getByRole('heading', { name: 'Available lecture materials' })).toBeVisible();
            await expect(page.getByRole('link', { name: 'First reading' }).first()).toBeVisible();
            await expect(page.getByRole('link', { name: 'Read the field guide before Friday.' })).toBeVisible();
            await expect(page.getByText(/1 of \d+ available lessons completed/)).toBeVisible();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: `.agent-work/${role}-${info.project.name}.png`, fullPage: true });
    });
}
