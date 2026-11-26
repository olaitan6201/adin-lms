import { expect, test } from '@playwright/test';

test('same-name second marking never unlocks the published learner', async ({ page }) => {
    // Supply a name collision at the built fixture boundary, without modifying the shipped roster.
    await page.route(/\/assets\/gradebook-[^/]+\.js$/i, async route => {
        const response = await route.fetch();
        const body = (await response.text()).replaceAll('Chinedu Okafor', 'Blessing Okonkwo');
        await route.fulfill({ response, body });
    });
    await page.goto('/admin/gradebook');
    const locked = page.getByRole('row').filter({ hasText: 'AOU/2023/0412' });
    const eligible = page.getByRole('row').filter({ hasText: 'AOU/2024/1187' });
    await expect(eligible).toContainText('Blessing Okonkwo');
    await page.getByRole('button', { name: 'Second marker' }).click();
    const dialog = page.getByRole('dialog');
    const option = dialog.getByRole('option', { name: /Blessing Okonkwo/ });
    await dialog.getByLabel('Student').selectOption({ label: await option.innerText() });
    await dialog.getByLabel('Reason').fill('Reviewed the selected script');
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(eligible).toContainText('Approved');
    await expect(locked.getByRole('spinbutton').first()).toBeDisabled();
    await expect(locked).toContainText('Published');
});

test('score edits validate, regrade and enter moderation with one history entry', async ({ page }) => {
    await page.goto('/admin/gradebook');
    const row = page.getByRole('row').filter({ hasText: 'AOU/2023/0901' });
    const score = row.getByRole('spinbutton').first();
    await expect(page.getByRole('columnheader', { name: 'Recorded grade' })).toBeVisible();
    await expect(row.getByRole('cell', { name: '75', exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: 'B', exact: true })).toBeVisible();
    await expect(row).toContainText('Approved');
    await page.getByRole('button', { name: 'Weights and rubric' }).click();
    await expect(page.getByRole('heading', { name: 'Boundaries for score edits' })).toBeVisible();
    await expect(page.locator('dt').filter({ hasText: /^A$/ }).locator('+ dd')).toContainText('70 – 100');
    await page.getByRole('button', { name: 'Score sheet', exact: true }).click();
    await score.fill('21');
    await score.press('Tab');
    await expect(score).toHaveValue('15');
    await score.fill('15');
    await score.press('Tab');
    await page.getByRole('button', { name: 'History', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(3);
    await page.getByRole('button', { name: 'Score sheet', exact: true }).click();
    await score.fill('17');
    await score.press('Tab');
    await expect(row.getByRole('cell', { name: '77', exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: 'A', exact: true })).toBeVisible();
    await expect(row).toContainText('In moderation');
    await page.getByRole('button', { name: 'History', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(4);
    await expect(page.locator('tbody tr').first()).toContainText('AOU/2023/0901: ca 15 to 17');
});

test('only the officer can confirm release and only approved rows are released', async ({ page }) => {
    await page.goto('/lecturer/gradebook');
    await page.getByRole('button', { name: 'Publish results' }).first().click();
    await expect(page.getByRole('dialog')).toContainText('reserved for the authorised examination officer');
    await expect(page.getByRole('button', { name: 'Confirm publication' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Second marker' }).click();
    await expect(page.getByRole('option', { name: 'Approve', exact: true })).toHaveCount(0);
    await page.goto('/admin/gradebook');
    await page.getByRole('button', { name: 'Publish results' }).first().click();
    await expect(page.getByRole('dialog')).toContainText('75 total. Recorded grade: B. Boundary preview: A.');
    await page.getByRole('button', { name: 'Confirm publication' }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Published' })).toHaveCount(3);
    await expect(page.getByRole('row').filter({ hasText: 'AOU/2023/0901' })).toContainText('Published');
    await expect(page.getByRole('row').filter({ hasText: 'AOU/2023/0901' }).getByRole('cell', { name: 'B', exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'In moderation' })).toHaveCount(2);
    await expect(page.getByRole('row').filter({ hasText: 'Entered' })).toHaveCount(1);
});

test('an officer cannot mark or release another result once all results are published', async ({ page }) => {
    await page.goto('/admin/gradebook');
    const dialog = page.getByRole('dialog');
    for (const matric of ['AOU/2024/1187', 'AOU/2022/0067', 'AOU/2024/1322']) {
        await page.getByRole('button', { name: 'Second marker' }).click();
        await dialog.getByLabel('Student').selectOption(matric);
        await dialog.getByLabel('Reason').fill('Script reviewed for publication');
        await dialog.getByRole('button', { name: 'Save' }).click();
    }
    const publish = page.getByRole('button', { name: 'Publish results' }).first();
    await publish.click();
    await dialog.getByRole('button', { name: 'Confirm publication' }).click();
    await page.getByRole('button', { name: 'Second marker' }).click();
    await expect(dialog).toContainText('No unpublished results');
    await expect(dialog.getByRole('button', { name: 'Save' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await publish.click();
    await expect(dialog.getByRole('button', { name: 'Confirm publication' })).toBeDisabled();
});
