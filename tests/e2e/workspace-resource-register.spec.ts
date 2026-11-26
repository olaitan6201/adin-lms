import { expect, test } from '@playwright/test';

test('restoring a version commits immediately but access changes wait for Save', async ({ page }) => {
    await page.goto('/admin/content');
    const resource = page.getByRole('row').filter({ hasText: 'Trial balance template' });
    const versions = resource.getByRole('button', { name: 'Versions' });
    const dialog = page.getByRole('dialog', { name: 'Trial balance template' });
    const from = dialog.getByLabel('Visible from');
    const downloads = dialog.getByLabel('Allow download on mobile and desktop');

    await versions.click();
    const originalDate = await from.inputValue();
    await from.fill('2027-02-02');
    await downloads.check();
    const previousVersion = dialog.getByRole('listitem').filter({ has: page.getByText('v3', { exact: true }) });
    await previousVersion.getByRole('button', { name: 'Restore' }).click();
    await expect(dialog.getByText('v3 · current')).toBeVisible();
    await expect(from).toHaveValue('2027-02-02');
    await expect(downloads).toBeChecked();

    await page.keyboard.press('Escape');
    await expect(versions).toBeFocused();
    await expect(resource.getByText('v3', { exact: true })).toBeVisible();
    await versions.click();
    await expect(from).toHaveValue(originalDate);
    await expect(downloads).not.toBeChecked();
    await downloads.check();
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await versions.click();
    await expect(downloads).toBeChecked();
    await expect(dialog.getByText('v3 · current')).toBeVisible();
});

test('picker rejects a mixed batch; picker and drop each add an independent resource', async ({ page }) => {
    await page.goto('/admin/content');
    const payload = (name: string) => ({ name, mimeType: 'text/plain', buffer: Buffer.from('sample') });
    await page.getByLabel('Select resources').setInputFiles([payload('rejected.txt'), payload('bad.exe')]);
    await expect(page.getByRole('status').filter({ hasText: 'Upload rejected' })).toBeVisible();
    await expect(page.getByText('rejected.txt', { exact: true })).toHaveCount(0);

    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Upload resource', exact: true }).first().click();
    await (await chooser).setFiles(payload('picked.txt'));
    await expect(page.getByRole('tab', { name: 'Resource register' })).toHaveAttribute('aria-selected', 'true');
    const transfer = await page.evaluateHandle(() => {
        const data = new DataTransfer();
        data.items.add(new File(['notes'], 'dropped.pdf', { type: 'application/pdf' }));
        return data;
    });
    await page.getByRole('button', { name: /Drop files to upload/ }).dispatchEvent('drop', { dataTransfer: transfer });
    await transfer.dispose();
    for (const name of ['picked.txt', 'dropped.pdf']) {
        const row = page.getByRole('row').filter({ hasText: name });
        await expect(row).toContainText('v1');
        await row.getByRole('button', { name: 'Versions' }).click();
        const dialog = page.getByRole('dialog', { name });
        await expect(dialog.getByRole('listitem')).toHaveCount(1);
        await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    }
});
