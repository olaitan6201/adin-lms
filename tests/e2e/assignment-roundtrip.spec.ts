import { expect as playwrightExpect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const expect = playwrightExpect.configure({ timeout: 15_000 });

async function login(page: Page, account: string) {
    await page.goto('/login');
    await page.locator('input[name=email]').fill(`${account}@demo.example.test`);
    await page.locator('input[name=password]').fill('password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).press('Enter');
    if (account.startsWith('assignment-author')) {
        await expect(page).toHaveURL(/\/security\/challenge$/);
        const otp = execFileSync('php', ['-r',
            'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
            join(process.env.PORTAL_E2E_RUN!, `${account}.factor`)], { encoding: 'utf8' });
        await page.getByLabel('Authenticator code').fill(otp);
        await page.getByRole('button', { name: /verify code/i }).press('Enter');
    }
    await expect(page).toHaveURL(/\/dashboard$/);
}

test('assignment opens, accepts a revision, and returns the lecturer’s mark', async ({ page, browser }, info) => {
    test.setTimeout(120_000);
    const run = process.env.PORTAL_E2E_RUN!;
    const project = info.project.name;
    const course = readFileSync(join(run, `assignment-${project}.course`), 'utf8');
    const desk = `/courses/${course}/assessments`;
    await login(page, `assignment-author-${project}`);
    await page.goto(desk);
    await page.getByLabel('Grade label').fill('Pass');
    await page.getByLabel('Title', { exact: true }).fill('Study plan');
    await page.getByLabel('Maximum points').fill('10');
    await page.getByRole('button', { name: 'Activate gradebook' }).press('Enter');
    await page.getByLabel('Instructions').fill('Describe the steps in your study plan.');
    const date = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 16);
    await page.getByLabel('Opens (server time)').fill(date(-1));
    await page.getByLabel('Due (server time)').fill(date(1));
    await page.getByLabel('Closes (server time)').fill(date(2));
    await page.getByRole('button', { name: 'Open assignment' }).focus();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: join(run, `${project}-setup.png`) });
    await page.keyboard.press('Enter');
    await page.getByRole('link', { name: 'View assignment' }).press('Enter');
    await expect(page.getByText('No submissions yet.')).toBeVisible();
    const learner = await browser.newPage({ baseURL: info.project.use.baseURL, viewport: info.project.use.viewport });
    try {
        await login(learner, `exam-learner-${project}`);
        await learner.goto(desk);
        await learner.getByRole('link', { name: 'View assignment' }).press('Enter');
        await learner.getByRole('button', { name: 'Submit revision' }).press('Enter');
        await expect(learner.getByRole('group', { name: 'Check your entries' })).toBeFocused();
        const answer = learner.getByRole('textbox', { name: 'Answer', exact: true });
        await expect(answer).toHaveAccessibleDescription(/required/i);
        await learner.keyboard.press('Tab');
        await expect(answer).toBeFocused();
        expect(await learner.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await learner.screenshot({ path: join(run, `${project}-submission-error.png`) });
        await answer.fill('Read the brief, schedule study blocks, review progress.');
        await learner.getByRole('button', { name: 'Submit revision' }).press('Enter');
        await expect(learner.getByText('Revision received.', { exact: false })).toBeVisible();
        await page.reload();
        await page.getByText('Mark this revision', { exact: true }).press('Enter');
        await page.getByLabel('Points', { exact: true }).fill('11');
        await page.getByLabel('Feedback', { exact: true }).fill('Clear, achievable steps.');
        await page.getByLabel('Reason for this mark').fill('Accurate planning sequence');
        await page.getByLabel('Return this mark').check();
        await page.getByRole('button', { name: 'Record mark' }).press('Enter');
        await expect(page.getByLabel('Points', { exact: true })).toHaveAccessibleDescription(/exceed/i);
        await expect(page.getByLabel('Feedback', { exact: true })).toHaveValue('Clear, achievable steps.');
        await page.getByLabel('Points', { exact: true }).fill('8');
        await page.getByRole('button', { name: 'Record mark' }).press('Enter');
        await expect(page.getByText(/Mark: 8.*Returned/)).toBeVisible();
        await learner.reload();
        await expect(learner.getByRole('button', { name: 'Submit revision' })).toHaveCount(0);
        await expect(learner.getByText('Clear, achievable steps.')).toBeVisible();
        await expect(learner.getByText(/Mark: 8.*Returned/)).toBeVisible();
        await learner.screenshot({ path: join(run, `${project}-returned.png`), fullPage: true });
    } finally {
        await learner.close();
    }
});
