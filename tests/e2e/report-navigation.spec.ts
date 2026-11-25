import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

async function signIn(page: Page, account: 'officer' | 'report-qa') {
    await page.goto('/login');
    await page.locator('input[name=email]').fill(`${account}@demo.example.test`);
    const password = page.getByLabel('Password', { exact: true });
    await password.fill('password');
    await password.press('Enter');
    const factor = join(process.env.PORTAL_E2E_RUN!, `${account}.factor`);
    const code = execFileSync('php', ['-r', 'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));', factor], { encoding: 'utf8' });
    await page.getByLabel('Authenticator code').fill(code);
    await page.getByLabel('Authenticator code').press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
}

test('QA sees the scope explanation and a recovery action instead of student filters', async ({ page }) => {
    await signIn(page, 'report-qa');
    await page.goto('/reports?session=00000000-0000-4000-8000-000000000001');
    const main = page.getByRole('main');
    await expect(main.getByText('Quality assurance · Academic reports')).toBeVisible();
    await expect(main.getByRole('status')).toHaveText('No reporting scope assigned.');
    await expect(main.getByText(/Contact your academic office/)).toBeVisible();
    await expect(main.getByText('Report filters', { exact: true })).toHaveCount(0);
    await main.getByRole('link', { name: 'Clear 1 applied filter' }).press('Enter');
    await expect(page).toHaveURL(/\/reports\?family=activity$/);
    await expect(main.getByRole('status')).toHaveText('No reporting scope assigned.');
});

test('officer can read, filter and export the current report with the keyboard', async ({ page }, info) => {
    test.slow();
    await signIn(page, 'officer');

    for (const width of info.project.name === 'phone' ? [390, 320] : [1366, 683]) {
        // A 1366 × 844 desktop at 200% browser zoom has a 683 × 422 layout viewport.
        await page.setViewportSize({ width, height: width === 683 ? 422 : width === 320 ? 700 : 844 });
        await page.goto('/reports');
        const main = page.getByRole('main');
        await expect(main.getByRole('status')).toBeInViewport();
        await expect(main.getByText('Scope: Institution-wide')).toBeInViewport();
        await page.screenshot({ path: `.agent-work/report-${width}.png` });

        await main.getByText('Change report type', { exact: true }).press('Enter');
        await page.keyboard.press('Tab');
        await expect(main.getByRole('link', { name: 'Institution usage' })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(main.getByRole('link', { name: 'Course completion' })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(main.getByRole('heading', { name: 'Course completion' })).toBeVisible();
        await main.getByText('Report filters', { exact: true }).press('Space');
        for (const label of ['Academic session', 'Semester', 'Course offering']) {
            await page.keyboard.press('Tab');
            await expect(main.getByRole('combobox', { name: label })).toBeFocused();
        }
        await page.keyboard.press('ArrowDown');
        const offering = await main.getByLabel('Course offering').inputValue();
        expect(offering).not.toBe('');
        await page.keyboard.press('Tab');
        await expect(main.getByRole('button', { name: 'Apply filters' })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`offering=${offering}`));
        const data = main.getByRole('region', { name: 'Report data' });
        await main.getByRole('link', { name: 'Clear 1 applied filter' }).focus();
        await page.keyboard.press('Tab');
        await expect(main.getByText('Change report type', { exact: true })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(main.getByText('Report filters', { exact: true })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(data).toBeFocused();
        await expect(data.getByRole('row').nth(1)).toBeInViewport();
        if (width < 400) {
            await page.keyboard.press('End');
            await page.keyboard.press('ArrowRight');
            await expect.poll(() => data.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
        }
        await page.keyboard.press('Tab');
        await expect(main.getByRole('link', { name: 'Download PDF' })).toBeFocused();
        const downloading = page.waitForEvent('download');
        await page.keyboard.press('Enter');
        expect((await downloading).suggestedFilename()).toMatch(/\.pdf$/);
        await main.getByRole('link', { name: 'Clear 1 applied filter' }).press('Enter');
        await expect(page).toHaveURL(/\/reports\?family=completion$/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }

    await page.goto('/reports?family=completion&session=00000000-0000-4000-8000-000000000001');
    await expect(page.getByText('No records match these filters.')).toBeVisible();
    await expect(page.getByText('Scope: Institution-wide')).toBeVisible();
    await page.getByRole('link', { name: 'Clear 1 applied filter' }).press('Enter');
    await expect(page.getByRole('region', { name: 'Report data' })).toBeVisible();
});
