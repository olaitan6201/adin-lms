import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('admin manuscript history downloads the authored v1 PDF', async ({ page }) => {
    await page.goto('/admin/content');
    const row = page.getByRole('row').filter({ hasText: 'Week 3 manuscript: journals and ledgers' });
    await row.getByRole('button', { name: 'Versions' }).click();
    const event = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download sample manuscript' }).click();
    const download = await event;
    expect(download.suggestedFilename()).toBe('acc302-week3-v1.pdf');
    const bytes = await readFile((await download.path())!);
    expect(bytes).toEqual(await readFile('resources/js/data/registry/acc302-week3-v1.pdf'));
    expect(bytes.toString('latin1')).toContain('Worked example: a sale on credit');
});

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
    await page.keyboard.press('Escape');
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Content report' }).click();
    const records = JSON.parse(await readFile((await (await downloaded).path())!, 'utf8'));
    expect(records.find((record: { name: string }) => record.name === 'Trial balance template')).toMatchObject({
        version: 'v3',
        download: true,
        from: originalDate,
    });
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
    await page
        .getByRole('button', { name: /Drop files to upload/ })
        .dispatchEvent('drop', { dataTransfer: transfer });
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

test('saved policy controls the picker, drops and report across tabs and reload', async ({ page }) => {
    await page.goto('/admin/content');
    const tab = page.getByRole('tab', { name: 'Resource register' });
    await tab.click();
    await page.getByRole('button', { name: 'Edit allow-list' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Documents').fill('PDF, EXE');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('not a supported file type');
    await dialog.getByLabel('Documents').fill('PDF');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByRole('tab', { name: 'Modules and resources' }).click();
    await tab.click();
    await expect(page.getByRole('row').filter({ hasText: 'Documents' }).getByRole('cell').nth(1)).toHaveText(
        'PDF',
    );
    await page.reload();
    const picker = page.getByLabel('Select resources');
    await expect(picker).not.toHaveAttribute('accept', /\.txt/);
    const file = (name: string) => ({ name, mimeType: 'text/plain', buffer: Buffer.from('test') });
    await picker.setInputFiles([file('mixed.pdf'), file('removed.txt')]);
    await expect(page.getByRole('status').filter({ hasText: 'Upload rejected' })).toBeVisible();
    const data = await page.evaluateHandle(() => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['test'], 'dropped.txt'));
        return transfer;
    });
    await page.getByRole('button', { name: /Drop files/ }).dispatchEvent('drop', { dataTransfer: data });
    await picker.setInputFiles(file('kept.pdf'));
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Content report' }).click();
    const records = JSON.parse(await readFile((await (await downloaded).path())!, 'utf8'));
    const names = records.map((r: { name: string }) => r.name);
    expect(names).toContain('kept.pdf');
    for (const rejected of ['mixed.pdf', 'removed.txt', 'dropped.txt']) expect(names).not.toContain(rejected);
});
