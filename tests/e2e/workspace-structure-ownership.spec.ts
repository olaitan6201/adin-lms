import { expect, test } from '@playwright/test';

test('session windows stay with their owner; adding a programme increments only its department', async ({
    page,
}) => {
    await page.goto('/admin/structure');
    const dialog = page.getByRole('dialog');
    const row = (label: string) => page.getByRole('row').filter({ hasText: label });
    await row('2024/2025').getByRole('button', { name: 'Manage' }).click();
    await expect(dialog).toContainText('No semester windows recorded');
    await expect(dialog).not.toContainText('08 Sep 2025');
    await dialog.getByLabel('Session label').fill('Archived edit');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await row('Archived edit').getByRole('button', { name: 'Manage' }).click();
    await expect(dialog).toContainText('No semester windows recorded');
    await page.keyboard.press('Escape');
    await row('2025/2026').getByRole('button', { name: 'Manage' }).click();
    await expect(dialog).toContainText('08 Sep 2025');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Add programme' }).click();
    await dialog.getByLabel('Programme', { exact: true }).fill('Analytical Chemistry');
    await dialog.getByLabel('Code', { exact: true }).fill('ANL');
    await dialog.getByLabel('Department').selectOption('CHM');
    await dialog.getByLabel('Units').fill('22');
    await dialog.getByRole('button', { name: 'Add programme' }).click();
    const department = page.getByRole('listitem').filter({ hasText: 'Chemistry' });
    await expect(department).toContainText('2 programmes');
    await expect(department).toContainText('ANL L100');
    const other = page.getByRole('listitem').filter({ hasText: 'Mathematics and Statistics' });
    await expect(other).toContainText('3 programmes');
    await expect(other).not.toContainText('ANL');
    await page.getByRole('button', { name: 'Add faculty or department' }).click();
    await dialog.getByLabel('Type').selectOption('Department');
    await dialog.getByLabel('Name', { exact: true }).fill('Another chemistry');
    await dialog.getByLabel('Code', { exact: true }).fill('chm');
    await dialog.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('must be unique');
});
