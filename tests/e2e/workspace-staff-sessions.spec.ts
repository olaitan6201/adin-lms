import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('staff-specific revocation survives reopening and agrees with monitor and filtered export', async ({
    page,
}) => {
    await page.goto('/admin/people');
    const search = page.getByLabel('Search staff');
    await search.fill('Oyelaran');
    const details = page.getByRole('button', { name: 'Details' });
    await details.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Email').fill('dean@example.test');
    await dialog.getByRole('button', { name: 'Revoke' }).click();
    await expect(dialog).toContainText('Sessions: 1');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    const records = JSON.parse(await readFile((await (await downloaded).path())!, 'utf8'));
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ id: 'u-002', email: 'dean@example.test' });
    await details.click();
    await expect(dialog.getByText('Revoked', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Session monitor' }).click();
    const staff = dialog.getByLabel('Staff member');
    await staff.selectOption('u-002');
    await expect(dialog.getByText('Revoked', { exact: true })).toBeVisible();
    await staff.selectOption('u-001');
    await expect(dialog.getByRole('button', { name: 'Revoke' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('tab', { name: /Roles and permissions/ }).click();
    const row = page.getByRole('row').filter({ hasText: 'Manage academic structure' });
    await expect(row.getByRole('cell').nth(4)).toHaveText('Own faculty');
    await expect(row.getByRole('cell').nth(3).getByLabel('No access')).toBeVisible();
});
