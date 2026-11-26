import { expect, test } from '@playwright/test';

for (const role of ['admin', 'lecturer', 'student']) {
    test(`${role} group and conversation shortcuts focus their selected workspace controls`, async ({ page }) => {
        await page.goto(`/${role}/communication`);
        await page.getByRole('tab', { name: role === 'student' ? 'My groups' : 'Group discussions' }).click();
        await expect(page.getByRole('button', { name: 'Create group' })).toHaveCount(role === 'student' ? 0 : 1);
        await page.getByRole('button', { name: 'Shared files' }).press('Enter');
        await expect(page.getByRole('heading', { name: 'Shared files' })).toBeFocused();
        await page.getByRole('button', { name: 'Post a group message' }).press('Enter');
        await expect(page.getByLabel('Write to your group')).toBeFocused();

        await page.getByRole('tab', { name: /Messages/ }).click();
        const panel = page.getByRole('tabpanel');
        await expect(panel.getByText('Today, 09:12')).toBeVisible();
        await expect(panel.getByText('Today, 09:34')).toBeVisible();
        await panel.getByRole('button', { name: /Examinations Office/ }).click();
        await panel.getByRole('button', { name: 'Reply' }).press('Enter');
        const reply = panel.getByRole('textbox', { name: 'Write a message' });
        await expect(reply).toBeFocused();
        await reply.fill('Schedule confirmed');
        await reply.press('Enter');
        await expect(panel.locator('p').filter({ hasText: 'Schedule confirmed' })).toContainText(/Today, \d\d:\d\d/);
    });
}

test('pinning a moved topic gives it priority in both moderation entry points', async ({ page }) => {
    await page.goto('/lecturer/communication');
    const title = /Group 4 presentation/;
    await page.getByRole('row', { name: title }).getByRole('button', { name: 'Open' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Pin this thread/).check();
    await dialog.getByLabel('Move thread').selectOption({ label: 'Journal entries: where do debits begin?' });
    await dialog.getByRole('button', { name: 'Post reply' }).click();
    const rows = page.getByRole('table').nth(1).locator('tbody tr');
    await expect(rows.first()).toContainText(title);
    await page.getByRole('row', { name: /Journal entries: where/ }).getByRole('button').click();
    await expect(dialog.getByRole('heading', { name: title })).toBeVisible();
    await expect(dialog).toContainText('moderation audit trail');
    await dialog.getByLabel(/Pin this thread/).uncheck();
    await dialog.getByRole('button', { name: 'Post reply' }).click();
    await expect(rows.first()).not.toContainText(title);
});

test('printed student report contains the selected measures without workspace controls', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.getByRole('tab', { name: 'Student' }).click();
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('heading', { name: 'Student', exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: /Aisha Bello/ })).toContainText('Not reported');
    await expect(page.getByRole('heading', { name: 'Course report', exact: true })).toBeHidden();
    await expect(page.getByRole('tablist')).toBeHidden();
    await expect(page.getByRole('button', { name: 'PDF' })).toBeHidden();
    await expect(page.locator('.workspace-shell > div > header')).toBeHidden();
    await expect(page.getByLabel('Primary navigation')).toBeHidden();
});
