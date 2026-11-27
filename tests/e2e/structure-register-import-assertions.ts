import { readFile } from 'node:fs/promises';
import { expect, type Locator, type Page } from '@playwright/test';
import { verifyRegisterDrawerContrast } from './structure-register-accessibility';
import { structureSpreadsheet } from './structure-spreadsheet';

const fields = ['kind', 'code', 'name', 'department_code', 'programme_code', 'specialization_code', 'position'];

export async function verifySharedRegisterImport(page: Page, suffix: string, department: string, capture: string) {
    const trigger = page.getByRole('button', { name: 'Import shared register', exact: true });
    await expect(trigger).toBeVisible();
    await trigger.press('Enter');
    const drawer = page.getByRole('dialog', { name: 'Import shared register' });
    const file = drawer.locator('input[type="file"]');
    const downloadStarted = page.waitForEvent('download');
    await drawer.getByRole('link', { name: /download.*csv/i }).click();
    const download = await downloadStarted;
    const content = await readFile(await download.path(), 'utf8');
    expect(content.split(/\r?\n/)[0]).toBe(fields.join(','));

    await file.setInputFiles(structureSpreadsheet([
        fields,
        ['specializations', 'INVALID', 'Unmatched department', 'NOT-A-DEPARTMENT', '', '', ''],
    ], suffix === 'phone'));
    await drawer.getByRole('button', { name: 'Read columns' }).click();
    await page.keyboard.press('Tab');
    await verifyRegisterDrawerContrast(drawer, file);
    await drawer.getByRole('button', { name: 'Preview import' }).click();
    await expect(drawer.getByText(/Row 2:/)).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Confirm import' })).toHaveCount(0);

    const programme = `IMP-${suffix}`;
    const track = `TRACK-${suffix}`;
    await file.setInputFiles(structureSpreadsheet([
        [...fields.slice(0, -1), 'Sort order'],
        ['pathways', '', '', department, programme, track, ''],
        ['programme-levels', 'IMPLVL', `Imported level ${suffix}`, '', programme, '', '2'],
        ['specializations', track, `Imported specialization ${suffix}`, department, '', '', ''],
        ['shared-programmes', programme, `Imported programme ${suffix}`, '', '', '', ''],
    ], suffix === 'phone'));
    await drawer.getByRole('button', { name: 'Read columns' }).click();
    const position = drawer.getByRole('combobox', { name: /position|display order/i });
    await page.keyboard.press('Tab');
    await verifyRegisterDrawerContrast(drawer, position);
    await position.selectOption('6');
    await drawer.getByRole('button', { name: 'Preview import' }).click();
    const summary = drawer.getByText(/4 to add.*nothing saved yet/i);
    await expect(summary).toBeVisible();
    await expect(drawer.getByText(`Imported programme ${suffix}`, { exact: true })).toBeVisible();
    await expect(drawer.getByRole('listitem').filter({ hasText: `Imported level ${suffix}` })).toContainText('Position: 2');
    expect(await drawer.evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(
        await drawer.evaluate(element => element.clientWidth),
    );
    await summary.scrollIntoViewIfNeeded();
    await expect(summary).toBeInViewport();
    await page.screenshot({ path: capture, animations: 'disabled' });
    const observer = await page.context().newPage();
    try {
        await observer.goto(page.url());
        const programmes = observer.getByRole('region', { name: 'Shared programmes', exact: true });
        await expect(programmes).toBeVisible();
        await expect(programmes.getByRole('row').filter({ hasText: programme })).toHaveCount(0);
    } finally {
        await observer.close();
    }

    await confirmWithPendingCheck(page, drawer);
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await page.reload();
    const pathways = page.getByRole('region', { name: 'Academic pathways', exact: true });
    const row = pathways.getByRole('row').filter({ hasText: `Imported specialization ${suffix}` });
    await expect(row).toContainText(`Imported programme ${suffix}`);
    await expect(page.getByRole('region', { name: 'Programme levels', exact: true })
        .getByRole('row').filter({ hasText: `Imported level ${suffix}` })).toContainText('IMPLVL');
}

async function confirmWithPendingCheck(page: Page, drawer: Locator) {
    let release: () => void = () => {};
    const delayed = new Promise<void>(resolve => {
        release = resolve;
    });
    await page.route('**/admin/structure/register/import', async route => {
        await delayed;
        await route.continue();
    }, { times: 1 });

    try {
        await drawer.getByRole('button', { name: 'Confirm import' }).click();
        await expect(drawer.getByRole('status').filter({ hasText: /importing|saving/i })).toBeVisible();
        await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeDisabled();
        await expect(drawer.locator('input[type="file"]')).toBeDisabled();
        await page.keyboard.press('Escape');
        await expect(drawer).toBeVisible();
    } finally {
        release();
    }
}
