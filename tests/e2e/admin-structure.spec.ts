import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { verifyNarrowHierarchy, verifyOversight } from './structure-layout-assertions';
import { verifyAcademicRegister } from './structure-register-assertions';

const structureUrl = '/admin/structure';

function spreadsheet(rows: string[][], xlsx: boolean) {
    if (!xlsx) {
        return { name: 'structure.csv', mimeType: 'text/csv', buffer: Buffer.from(rows.map(row => row.join(',')).join('\n')) };
    }

    const buffer = execFileSync('php', [
        '-r',
        'require "vendor/autoload.php"; $book = new PhpOffice\\PhpSpreadsheet\\Spreadsheet; $book->getActiveSheet()->fromArray(json_decode($argv[1], true, flags: JSON_THROW_ON_ERROR)); (new PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx($book))->save("php://output");',
        JSON.stringify(rows),
    ]);

    return { name: 'structure.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer };
}

test('structure imports and manual changes persist after reload', async ({ page }, info) => {
    test.setTimeout(65_000);
    const role = `structure-${info.project.name}`;
    const secret = join(process.env.PORTAL_E2E_RUN!, `${role}.factor`);
    const factor = execFileSync('php', [
        '-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        secret,
    ], { encoding: 'utf8' });
    await page.goto(structureUrl);
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('[name=email]').fill(`${role}@demo.example.test`);
    await page.locator('[name=password]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByLabel('Authenticator code').fill(factor);
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(/\/admin\/overview$/);
    await page.goto(structureUrl);
    await expect(page.getByRole('heading', { name: 'Academic structure', exact: true, level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Academic structure', exact: true, level: 2 })).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(info.project.use.viewport!.width);
    if (info.project.name === 'phone') {
        await page.getByRole('button', { name: 'Menu', exact: true }).click();
    }
    const structure = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Academic structure' });
    await expect(structure).toHaveAttribute('aria-current', 'page');
    if (info.project.name === 'phone') {
        await page.keyboard.press('Escape');
        await verifyNarrowHierarchy(page);
    }

    const suffix = info.project.name;
    const title = suffix === 'phone' ? `Faculty${'X'.repeat(184)}` : `Faculty ${suffix}`;
    const faculty = `FAC-${suffix}`;
    const department = `DEP-${suffix}`;
    const programme = `PGM-${suffix}`;
    const leadership = page.getByText(/\d+ of \d+ departments have an active head/);
    const previousDepartments = Number((await leadership.textContent())?.match(/of (\d+) departments/)?.[1]);
    const importTrigger = page.getByRole('button', { name: 'Import structure' });
    await importTrigger.press('Enter');
    const dialog = page.getByRole('dialog');
    const file = dialog.getByLabel(/structure file/i);
    const csv = `Identifier,Parent,Label,Kind\n${faculty},,${title},faculty\n${department},${faculty},Units ${suffix},department\n`;
    await file.setInputFiles({
        name: 'structure.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(`${csv}${programme},missing,Engineering ${suffix},programme\n`),
    });
    await dialog.getByRole('button', { name: 'Read columns' }).click();
    await dialog.getByLabel('Record type').selectOption('3');
    await dialog.getByRole('combobox', { name: 'Code', exact: true }).selectOption('0');
    await dialog.getByRole('combobox', { name: 'Name', exact: true }).selectOption('2');
    await dialog.getByLabel('Parent code').selectOption('1');
    await dialog.getByRole('button', { name: 'Preview import' }).click();
    await expect(dialog.getByText('Row 4: Parent code was not found.')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Confirm import' })).toHaveCount(0);
    await file.setInputFiles(spreadsheet([
        ['kind', 'code', 'name', 'parent_code'],
        ['faculty', faculty, title, ''],
        ['department', department, `Units ${suffix}`, faculty],
    ], suffix === 'phone'));
    await dialog.getByRole('button', { name: 'Read columns' }).click();
    await dialog.getByRole('button', { name: 'Preview import' }).click();
    await expect(dialog.getByText(/2 to add.*Nothing saved yet/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirm import' }).click();
    await expect(page.getByRole('status').filter({ hasText: '2 structure records added.' })).toBeVisible();
    await expect(importTrigger).toBeFocused();
    await expect(page.getByRole('heading', { name: new RegExp(title) })).toBeVisible();
    await expect(leadership).toContainText(`of ${previousDepartments + 1} departments`);
    await verifyOversight(page, title, suffix);
    await verifyAcademicRegister(page, suffix, info.outputPath('academic-pathways.png'));

    await page.getByRole('button', { name: 'Add legacy programme', exact: true }).click();
    await dialog.getByLabel('Programme', { exact: true }).fill(`Engineering ${suffix}`);
    await dialog.getByLabel('Code', { exact: true }).fill(programme);
    await dialog.getByLabel('Department', { exact: true }).selectOption({ label: `Units ${suffix}` });
    await dialog.getByRole('button', { name: 'Add legacy programme', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('row').filter({ hasText: programme })).toContainText(`Units ${suffix}`);
    const departmentRow = page.getByRole('listitem').filter({ hasText: `Units ${suffix}` });
    await expect(departmentRow).toContainText(programme);

    await page.getByRole('button', { name: 'Add faculty or department' }).click();
    await dialog.getByLabel('Type').selectOption('departments');
    await dialog.getByLabel('Name', { exact: true }).fill('Duplicate department');
    await dialog.getByLabel('Code', { exact: true }).fill(department);
    await dialog.getByRole('combobox', { name: 'Parent faculty' }).selectOption({ label: title });
    await dialog.getByRole('button', { name: 'Add department' }).click();
    const summary = dialog.getByRole('group', { name: 'Check your entries' });
    await expect(summary).toContainText('already been taken');
    await expect(summary).toBeFocused();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Add session' }).click();
    await dialog.getByLabel('Session label').fill(`Calendar ${suffix}`);
    await dialog.getByLabel('Starts on').fill('2028-01-10');
    await dialog.getByLabel('Ends on').fill('2028-12-20');
    await dialog.getByRole('button', { name: 'Add session' }).click();
    const session = page.getByRole('row').filter({ hasText: `Calendar ${suffix}` });
    await expect(session).toContainText('None recorded');
    await session.getByRole('button', { name: 'Manage' }).click();
    await expect(dialog.getByLabel('Starts on')).toHaveValue('2028-01-10');
    await dialog.getByLabel('Session label').fill(`Corrected ${suffix}`);
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await page.reload();
    await expect(page.getByRole('row').filter({ hasText: `Corrected ${suffix}` })).toContainText('None recorded');
});
