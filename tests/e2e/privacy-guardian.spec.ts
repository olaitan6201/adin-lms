import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

async function signIn(page: Page, login: string) {
    await page.goto('/login');
    await page.getByLabel('Email, matric number or staff ID').fill(`${login}@demo.example.test`);
    await page.getByLabel('Password', { exact: true }).fill('password');
    await page.getByRole('button', { name: /sign in/i }).press('Enter');
    if (login.startsWith('privacy-')) {
        const factor = join(process.env.PORTAL_E2E_RUN!, `${login}.factor`);
        const otp = execFileSync('php', ['-r', 'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));', factor], { encoding: 'utf8' });
        await page.getByLabel('Authenticator code').fill(otp);
        await page.getByRole('button', { name: /verify code/i }).press('Enter');
    }
    await expect(page).toHaveURL(/\/dashboard$/);
}

test('guardian can switch between two approved records using the displayed references', async ({ page }, info) => {
    await signIn(page, `guardian-${info.project.name}`);
    await page.goto('/guardian');
    const records = page.getByRole('link', { name: /View progress ·/ });
    await expect(records).toHaveCount(2);
    const references = (await records.allTextContents()).map(text => text.match(/· ([a-f0-9]{8})/)![1]);
    expect(references[0]).not.toBe(references[1]);
    await records.first().focus();
    for (const [index, reference] of references.entries()) {
        if (index > 0) {
            await expect(records.first()).toBeFocused();
            await page.keyboard.press('Tab');
        }
        await expect(records.nth(index)).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('heading', { name: `Shared progress · ${reference}` })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Completed lessons' })).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Back to approved records' })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(records).toHaveCount(2);
    }
});

test('privacy case corrections focus the rejected field and preserve valid entries', async ({ page, browser }, info) => {
    await signIn(page, `privacy-${info.project.name}`);
    await page.goto('/operations/privacy');
    const reference = page.getByLabel('External case reference');
    const subject = page.getByLabel(/Affected account UUID/);
    const submit = page.getByRole('button', { name: 'Open case', exact: true });
    await reference.fill(`CASE-${info.project.name}`);
    await reference.press('Tab');
    await expect(subject).toBeFocused();
    await page.keyboard.type('not-an-account');
    await subject.press('Tab');
    await expect(submit).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(subject).toBeFocused();
    await expect(subject).toHaveAccessibleDescription(/existing UUID/);
    await expect(page.getByText(/existing UUID/)).toHaveCount(1);
    await expect(reference).toHaveValue(`CASE-${info.project.name}`);
    await expect(page.getByText('Case opened.')).toHaveCount(0);
    await page.screenshot({ path: info.outputPath('case-correction.png') });
    await page.getByLabel('Case type').selectOption('breach');
    await subject.fill('');
    await reference.fill('bad reference!');
    await submit.press('Enter');
    await expect(reference).toBeFocused();
    await expect(reference).toHaveAccessibleDescription(/letters, numbers/i);
    await expect(page.getByLabel('Case type')).toHaveValue('breach');
    await reference.fill(`CASE-${info.project.name}`);
    await submit.press('Enter');
    await expect(page.getByText('Case opened.')).toBeVisible();
    await expect(page.getByRole('heading', { name: `CASE-${info.project.name} · breach` })).toBeVisible();
    const approve = page.getByRole('heading', { name: 'Approve a case action' }).locator('..');
    const account = approve.getByLabel('Subject account UUID');
    await account.fill('00000000-0000-4000-8000-000000000001');
    await approve.getByLabel('Case reference').fill(`CASE-${info.project.name}`);
    await approve.getByRole('button').press('Enter');
    await expect(account).toBeFocused();
    await expect(account).toHaveAccessibleDescription(/check the subject account UUID/i);
    await expect(approve.getByLabel('Case reference')).toHaveValue(`CASE-${info.project.name}`);
    const subjectId = readFileSync(join(process.env.PORTAL_E2E_RUN!, `privacy-subject-${info.project.name}`), 'utf8');
    await account.fill(subjectId);
    await approve.getByRole('button').press('Enter');
    const approval = (await approve.getByRole('status').innerText()).match(/[a-f0-9-]{36}/)![0];
    const executor = await browser.newPage({ baseURL: info.project.use.baseURL, viewport: page.viewportSize()! });
    try {
        await signIn(executor, `privacy-executor-${info.project.name}`);
        await executor.goto('/operations/privacy');
        const execute = executor.getByRole('heading', { name: 'Execute an approval' }).locator('..');
        const caseReference = execute.getByLabel('Case reference on the approval receipt');
        await execute.getByLabel('Subject account UUID').fill(subjectId);
        await execute.getByLabel('Approval UUID').fill(approval);
        await caseReference.fill('DIFFERENT-CASE');
        await execute.getByRole('checkbox').check();
        await execute.getByRole('button').press('Enter');
        await expect(caseReference).toBeFocused();
        await expect(caseReference).toHaveAccessibleDescription(/case reference recorded on this approval/);
        await expect(execute.getByRole('status')).toHaveCount(0);
        await caseReference.fill(`CASE-${info.project.name}`);
        await execute.getByRole('checkbox').check();
        await execute.getByRole('button').press('Enter');
        await expect(execute.getByRole('status')).toHaveText('Approved action completed.');
        await expect(execute.locator('pre')).toContainText(`guardian-${info.project.name}@demo.example.test`);
    } finally {
        await executor.close();
    }
    await page.getByLabel('Incident reference').fill(`INC-${info.project.name}`);
    await page.getByRole('button', { name: 'Record referral' }).press('Enter');
    await expect(page.getByText(/^Referral receipt:/)).toBeVisible();
    await page.goto('/operations');
    const retention = page.getByLabel('Retention period (days)');
    await retention.fill('0');
    await page.getByRole('button', { name: 'Save retention period' }).press('Enter');
    await expect(retention).toBeFocused();
    await expect(page.getByText('Retention period saved.')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
