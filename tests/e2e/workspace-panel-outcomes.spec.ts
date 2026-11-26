import { expect, test } from '@playwright/test';

test('an unavailable course keeps offering creation open until a valid selection is submitted', async ({ page }) => {
    await page.goto('/admin/delivery');
    await page.getByRole('tabpanel').getByRole('button', { name: 'New offering' }).click();
    const dialog = page.getByRole('dialog');
    const course = dialog.getByLabel('Course', { exact: true });
    const initial = await course.inputValue();
    await course.evaluate((select: HTMLSelectElement) => { select.selectedIndex = -1; });
    await dialog.getByRole('button', { name: 'Create offering' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Select an available course');
    await expect(page.getByRole('status').filter({ hasText: 'saved' })).toHaveCount(0);
    await course.selectOption(initial);
    await dialog.getByRole('button', { name: 'Create offering' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'New offering saved' })).toBeVisible();
});

test('restore preview explicitly reports that no restore was scheduled', async ({ page }) => {
    await page.goto('/admin/administration');
    await page.getByRole('tab', { name: 'Backup and recovery' }).click();
    await page.getByRole('button', { name: 'Restore', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Schedule restore' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'No restore was scheduled' })).toBeVisible();
});
