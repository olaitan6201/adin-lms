import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('BSC205 source preview, scope, publication and current total agree with local offerings', async ({
    page,
}) => {
    await page.goto('/admin/delivery');
    const row = page.getByRole('row').filter({ hasText: 'BSC205' });
    await row.getByRole('button', { name: 'Manage' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Previous session').selectOption({ index: 1 });
    await expect(dialog).toContainText('No reusable structure is available for BSC205 · 2023/2024');
    await expect(dialog.getByRole('button', { name: 'Copy structure' })).toBeDisabled();
    await dialog.getByLabel('Access scope').selectOption('Whole course');
    await dialog.getByRole('button', { name: 'Save offering' }).click();
    await row.getByRole('button', { name: 'Unpublish' }).click();
    await dialog.getByRole('button', { name: 'Unpublish offering' }).click();
    await page.getByRole('button', { name: 'New offering' }).first().click();
    await dialog.getByRole('button', { name: 'Create offering' }).click();
    await expect(page.getByText('80 offerings', { exact: true })).toBeVisible();
    const event = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Delivery report' }).click();
    const records = JSON.parse(await readFile((await (await event).path())!, 'utf8'));
    expect(records.find((r: { id: string }) => r.id === 'off-2')).toMatchObject({
        scope: 'Whole course',
        state: 'approved',
        students: 54,
    });
    expect(records.find((r: { id: string }) => r.id === 'off-1')).toMatchObject({
        scope: 'Assigned class only',
        state: 'published',
        students: 68,
    });
    expect(records).toHaveLength(7);
});
