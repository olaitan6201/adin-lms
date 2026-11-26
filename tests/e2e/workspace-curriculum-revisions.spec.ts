import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('Chemistry revision is isolated from approved history, Accounting and the exported catalogue', async ({
    page,
}) => {
    await page.goto('/admin/curriculum');
    const dialog = page.getByRole('dialog');
    await page.getByRole('button', { name: 'Add course' }).click();
    await dialog.getByLabel('Course code').fill('acc302');
    await dialog.getByLabel('Course title').fill('Duplicate');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('already in use');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'New curriculum version' }).click();
    await dialog.getByLabel('Programme').selectOption({ label: 'B.Sc. Chemistry' });
    await dialog.getByRole('button', { name: 'Create draft' }).click();
    const chemistry = page.getByRole('row').filter({ hasText: 'B.Sc. Chemistry' });
    await expect(chemistry).toContainText('v3 draft');
    await expect(chemistry).not.toContainText('04 Sep');
    await chemistry.getByRole('button', { name: 'Map outcomes' }).click();
    await expect(dialog).toContainText('No outcomes recorded');
    await expect(dialog).toContainText('v2 approved · 04 Sep 2026');
    await dialog.getByLabel('Draft outcomes (one per line)').fill('Analyse a sample');
    await dialog.getByRole('button', { name: 'Submit mapping' }).click();
    await expect(chemistry).toContainText('v3 awaiting approval');
    const event = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export curriculum' }).click();
    const catalogue = JSON.parse(await readFile((await (await event).path())!, 'utf8'));
    expect(catalogue.programmes.find((p: { id: string }) => p.id === 'p-chm').revisions).toEqual([
        { number: 2, state: 'approved', approved: '04 Sep 2026', outcomes: [] },
        { number: 3, state: 'awaiting approval', approved: null, outcomes: ['Analyse a sample'] },
    ]);
    expect(catalogue.programmes.find((p: { id: string }) => p.id === 'p-acc').revisions).toHaveLength(1);
    expect(catalogue.courses.filter((c: { code: string }) => c.code.toUpperCase() === 'ACC302')).toHaveLength(1);
    await page.getByRole('tab', { name: 'Outcome mapping' }).click();
    await page.getByRole('combobox', { name: 'Programme', exact: true }).selectOption('p-chm');
    await expect(page.getByRole('button', { name: 'Export matrix' })).toBeDisabled();
    await page.getByRole('combobox', { name: 'Programme', exact: true }).selectOption('p-acc');
    await expect(page.getByRole('table', { name: 'Course outcome to programme outcome weights' })).toBeVisible();
});
