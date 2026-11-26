import { expect, test } from '@playwright/test';

for (const role of ['admin', 'lecturer']) {
    test(`${role} opens the selected class and a separate schedule panel`, async ({ page }) => {
        await page.goto(`/${role}/classroom`);
        const dialog = page.getByRole('dialog');
        const first = page.getByRole('row').filter({ hasText: 'ACC302' }).getByRole('button', { name: 'Details' });
        const second = page.getByRole('row').filter({ hasText: 'ENG210' }).getByRole('button', { name: 'Details' });
        await first.click();
        await expect(dialog.getByLabel('Title', { exact: true })).toHaveValue('Tutorial: consolidation of accounts');
        await page.keyboard.press('Escape');
        await expect(first).toBeFocused();
        await second.click();
        await expect(dialog.getByRole('heading', { name: 'Workshop: narrative voice in prose' })).toBeVisible();
        await expect(dialog).toContainText('No session definition');
        await expect(dialog.getByLabel('Meeting link')).toHaveCount(0);
        await dialog.getByRole('button', { name: 'Close', exact: true }).click();
        await expect(second).toBeFocused();
        for (const schedule of await page.getByRole('button', { name: 'Schedule class' }).all()) {
            await schedule.click();
            await expect(dialog.getByRole('heading', { name: 'Schedule class' })).toBeVisible();
            await expect(dialog.getByLabel('Title', { exact: true })).toHaveValue('');
            await page.keyboard.press('Escape');
        }
        await first.click();
        await expect(dialog.getByLabel('Start time')).toHaveValue('16:00');
    });
}
