import { expect, test } from '@playwright/test';

for (const role of ['admin', 'lecturer']) {
    test(`${role} discards classroom drafts and reopens only locally saved values`, async ({ page }) => {
        await page.goto(`/${role}/classroom`);
        const dialog = page.getByRole('dialog');
        const title = dialog.getByLabel('Title', { exact: true });
        const tutorial = page.getByRole('row').filter({ hasText: 'ACC302', has: page.getByRole('button', { name: 'Details' }) });
        const details = tutorial.getByRole('button', { name: 'Details' });
        await details.click();
        await title.fill('Discarded tutorial title');
        await page.keyboard.press('Escape');
        await details.click();
        await expect(title).toHaveValue('Tutorial: consolidation of accounts');
        await title.fill('Revised tutorial');
        await dialog.getByLabel('Start time').fill('17:15');
        await dialog.getByLabel('Announcement').selectOption({ label: 'Enrolled students only' });
        await dialog.getByRole('button', { name: 'Save locally' }).click();
        await expect(tutorial).toContainText('Revised tutorial');
        await expect(tutorial).toContainText('17:15');
        await details.click();
        await expect(title).toHaveValue('Revised tutorial');
        await expect(dialog.getByLabel('Announcement')).toHaveValue('Enrolled students only');
        await dialog.getByRole('button', { name: 'Close', exact: true }).click();

        const schedule = page.getByRole('button', { name: 'Schedule class' }).first();
        await schedule.click();
        await title.fill('Discarded new class');
        await page.keyboard.press('Escape');
        await schedule.click();
        await expect(title).toHaveValue('');
        await title.fill('New local class');
        await dialog.getByLabel('Course').fill('HIS210');
        await dialog.getByLabel('Date', { exact: true }).fill('2026-12-02');
        await dialog.getByLabel('Start time').fill('10:30');
        await dialog.getByLabel('Duration').selectOption({ label: '90 minutes' });
        await dialog.getByRole('button', { name: 'Save locally' }).click();
        const created = page.getByRole('row').filter({ hasText: 'HIS210' });
        await expect(created).toContainText('New local class');
        await expect(created).toContainText('90 min');
        await created.getByRole('button', { name: 'Details' }).click();
        await expect(title).toHaveValue('New local class');
        await expect(dialog.getByLabel('Date', { exact: true })).toHaveValue('2026-12-02');
        await page.keyboard.press('Escape');
        await expect(tutorial).toContainText('Revised tutorial');
    });

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
