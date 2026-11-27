import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('a guardian can prepare a request without changing consent or exposing pending results', async ({ page }) => {
    await page.goto('/guardian/progress');
    const manage = page.getByRole('button', { name: 'Manage consent' });
    await manage.click();
    await expect(page.getByRole('dialog')).toContainText('Only the Registrar can change the approved scope.');
    await page.keyboard.press('Escape');
    await expect(manage).toBeFocused();

    await page.getByRole('button', { name: 'Report an issue' }).click();
    const dialog = page.getByRole('dialog', { name: 'Report an issue' });
    const courses = dialog.getByRole('combobox', { name: 'Published result' });
    await expect(courses.locator('option')).toHaveText(['BSC205', 'ENG210', 'MTH112']);
    await courses.selectOption('ENG210');
    await dialog.getByRole('textbox').fill('Please review the published result.');
    const file = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Download request' }).click();
    const request = await file;
    expect(request.suggestedFilename()).toBe('guardian-result-request.txt');
    const body = await readFile((await request.path())!, 'utf8');
    expect(body).toContain('Published result: ENG210');
    expect(body).not.toContain('ACC302');
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Consent active', { exact: true })).toBeVisible();
});

test('changing workspace text size announces the applied preference', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.getByRole('button', { name: 'Accessibility options' }).click();
    await page.getByRole('button', { name: 'Larger', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'xl');
    await expect(page.getByRole('status').filter({ hasText: 'Text size set to larger' })).toBeVisible();
});

test('guardian materials link only to the three shared sample files', async ({ page }) => {
    await page.goto('/guardian/progress');
    const manuscript = page.getByRole('link', { name: 'Week 3 manuscript (PDF)' });
    const download = page.waitForEvent('download');
    await manuscript.click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('acc302-week3-v1.pdf');
    const content = await readFile((await file.path())!);
    expect(content.subarray(0, 5).toString()).toBe('%PDF-');
    await expect(page.getByRole('link', { name: 'Practice set (DOCX)' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Trial balance template (XLSX)' })).toBeVisible();
    await expect(page.getByRole('link', { name: /lecture slides/i })).toHaveCount(0);
});
