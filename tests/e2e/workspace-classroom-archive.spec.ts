import { expect, test } from '@playwright/test';

for (const role of ['admin', 'lecturer']) {
    test(`${role} attributes archive controls, transcript excerpts and attachments to their own recording`, async ({ page }) => {
        await page.goto(`/${role}/classroom`);
        const archive = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Recordings and asynchronous material' }) });
        const rows = archive.locator('tbody tr');
        const dialog = page.getByRole('dialog');
        await expect(rows).toHaveCount(3);
        for (const [course, title, excerpt] of [
            ['CHM401', 'Practical briefing: titration', 'still processing'],
            ['ACC302', 'Tutorial: journal entries and ledgers', 'credit to sales'],
            ['ENG210', 'Workshop: narrative voice', 'narrator makes an inference'],
        ]) {
            const row = rows.filter({ hasText: course });
            for (const name of ['View recording record', 'Transcript', 'Attach']) {
                await expect(row.getByRole('button', { name, exact: true })).toHaveCount(1);
            }
            await row.getByRole('button', { name: 'Transcript', exact: true }).click();
            await expect(dialog.getByRole('heading')).toHaveText(`Transcript: ${title}`);
            await expect(dialog).toContainText(course);
            await expect(dialog).toContainText(excerpt);
            await page.keyboard.press('Escape');
        }

        const target = rows.filter({ hasText: 'ENG210' });
        const attach = target.getByRole('button', { name: 'Attach', exact: true });
        await attach.click();
        const module = dialog.getByLabel('Module in ENG210');
        const name = dialog.getByLabel('Resource name');
        const save = dialog.getByRole('button', { name: 'Attach locally' });
        await expect(module.locator('option')).toHaveText(['Choose a module', 'Narrative perspective', 'Group presentation']);
        await save.click();
        await expect(module).toBeFocused();
        await module.selectOption({ label: 'Group presentation' });
        await name.fill('  ');
        await save.click();
        await expect(dialog.getByRole('alert')).toContainText('resource name');
        await name.fill('Workshop replay');
        await module.evaluate((select: HTMLSelectElement) => {
            select.add(new Option('Unrelated module', 'ACC302-2', true, true));
        });
        await save.click();
        await expect(dialog.getByRole('alert')).toContainText('Choose a module from ENG210');
        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(archive).not.toContainText('Attached locally:');
        await attach.click();
        await expect(name).toHaveValue('Workshop: narrative voice');
        await module.selectOption({ label: 'Group presentation' });
        await name.fill('  Workshop replay  ');
        await save.click();
        await expect(target).toContainText('Attached locally: Workshop replay · Group presentation');
        await expect(rows.filter({ hasText: 'Attached locally:' })).toHaveCount(1);
        await attach.click();
        await expect(name).toHaveValue('Workshop replay');
        await name.fill('Discarded rename');
        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(target).toContainText('Attached locally: Workshop replay · Group presentation');
        await page.reload();
        await expect(archive).not.toContainText('Attached locally:');
    });
}
