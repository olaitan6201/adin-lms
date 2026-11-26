import { expect, test } from '@playwright/test';

test('course overview copy and status distinguish a saved draft from the approved text', async ({ page }) => {
    await page.goto('/admin/course');
    await expect(page.getByText(/shown here are the approved version/)).toBeVisible();
    await page.getByRole('button', { name: 'Edit course' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Course outline').fill('Draft for review');
    await dialog.getByRole('button', { name: 'Save draft' }).click();
    await expect(page.getByText('Draft for review')).toBeVisible();
    await expect(page.getByText(/outline shown here are a draft/)).toBeVisible();
    await expect(page.getByText(/shown here are the approved version/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Edit overview' }).click();
    await expect(dialog.getByLabel('Course outline')).toHaveValue('Draft for review');
});
