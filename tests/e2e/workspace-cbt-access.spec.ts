import { expect, test } from '@playwright/test';

for (const role of ['admin', 'lecturer']) {
    test(`${role} can edit permitted banks only`, async ({ page }) => {
        await page.goto(`/${role}/cbt`);
        const restricted = page.getByRole('row').filter({ hasText: 'Accounting theory essay prompts' });
        const open = page.getByRole('row').filter({ hasText: 'English literature comprehension' });
        const dialog = page.getByRole('dialog');
        if (role === 'admin') {
            await restricted.getByRole('button').click();
            await expect(dialog).toContainText('Explain why a trial balance');
            await expect(dialog).toContainText('does not create an audit entry');
        } else {
            await expect(restricted.getByRole('button')).toBeDisabled();
            await expect(page.getByText('Explain why a trial balance', { exact: false })).toHaveCount(0);
            await open.getByRole('button').click();
        }

        await dialog.getByRole('button', { name: 'Add question' }).click();
        await dialog.getByLabel('Stem').fill('Test item for this bank');
        await dialog.getByRole('button', { name: 'Save question' }).click();
        await expect(dialog).toContainText('Test item for this bank');
        await page.keyboard.press('Escape');
        await expect(restricted.getByRole('cell', { name: role === 'admin' ? '43' : '42', exact: true })).toBeVisible();
        await expect(open.getByRole('cell', { name: role === 'admin' ? '58' : '59', exact: true })).toBeVisible();
    });

    test(`${role} must correct an invalid sitting window before saving`, async ({ page }) => {
        await page.goto(`/${role}/cbt`);
        await page.getByRole('button', { name: /^Examinations/ }).click();
        const biology = page.getByRole('row').filter({ hasText: 'BSC205' });
        const dialog = page.getByRole('dialog');
        const closes = dialog.getByLabel('Access window closes');
        const save = dialog.getByRole('button', { name: 'Save', exact: true });
        await biology.getByRole('button').click();
        for (const value of ['2025-01-01T00:00', '2026-11-21T13:00', '']) {
            await closes.fill(value);
            await save.click();
            await expect(dialog.getByRole('alert')).toHaveText(value ? /must close after/ : /Enter a valid/);
            await expect(closes).toHaveValue(value);
        }

        await page.keyboard.press('Escape');
        await biology.getByRole('button').click();
        await expect(closes).toHaveValue('2026-11-21T14:00');
        await closes.fill('2026-11-21T14:05');
        await expect(dialog.getByRole('alert')).toHaveCount(0);
        await save.click();
        await biology.getByRole('button').click();
        await expect(closes).toHaveValue('2026-11-21T14:05');
        await page.keyboard.press('Escape');
        await page.getByRole('row').filter({ hasText: 'ACC302' }).getByRole('button').click();
        await expect(closes).toHaveValue('2026-11-18T10:45');
    });

    test(`${role} register identifies the manual sample code`, async ({ page }) => {
        await page.goto(`/${role}/attendance`);
        await page.getByRole('row').filter({ hasText: 'BSC205' }).getByRole('button').click();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: 'Manual session code' })).toBeVisible();
        await expect(dialog).toContainText('QR icon is illustrative');
        const code = dialog.locator('output');
        const initial = await code.textContent();
        await dialog.getByRole('button', { name: 'Refresh code' }).click();
        await expect(code).not.toHaveText(initial!);
        await expect(code).toHaveText(/^BSC205-/);
        await expect(dialog).not.toContainText(/a scan records|records the device/i);
    });
}
