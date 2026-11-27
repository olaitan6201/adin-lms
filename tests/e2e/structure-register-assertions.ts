import { expect, type Page } from '@playwright/test';
import {
    verifyEmptyAcademicRegister,
    verifyPendingRegisterSave,
    verifyRegisterDrawerContrast,
    verifyRegisterDrawerFocus,
    verifyRegisterHeaderContrast,
    verifyRegisterKeyboardScroll,
} from './structure-register-accessibility';

export async function verifyAcademicRegister(page: Page, suffix: string, capture: string) {
    const programme = `Undergraduate ${suffix}`;
    const track = `Computing ${suffix}`;
    const programmeOption = `${programme} (UG-${suffix})`;
    const specializationOption = `${track} (COMP) — DEP-${suffix}`;
    const openProgramme = page.getByRole('button', { name: 'Add shared programme', exact: true });
    const dialog = page.getByRole('dialog');
    if (suffix === 'desktop') {
        await verifyEmptyAcademicRegister(page);
    }

    await openProgramme.press('Enter');
    await verifyRegisterDrawerContrast(dialog);
    await verifyRegisterDrawerFocus(page, dialog);
    await dialog.getByLabel('Code', { exact: true }).fill(`UG-${suffix}`);
    await dialog.getByLabel('Programme name').fill(programme);
    await dialog.getByRole('button', { name: 'Add shared programme' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(openProgramme).toBeFocused();

    await openProgramme.click();
    await dialog.getByLabel('Code', { exact: true }).fill(`UG2-${suffix}`);
    await dialog.getByLabel('Programme name').fill(programme);
    await dialog.getByRole('button', { name: 'Add shared programme' }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Add programme level' }).click();
    await expect(dialog.getByRole('option', { name: `${programme} (UG2-${suffix})`, exact: true })).toHaveCount(1);
    await dialog.getByLabel('Shared programme').selectOption({ label: programmeOption });
    await dialog.getByLabel('Code', { exact: true }).fill('100');
    await dialog.getByLabel('Level label').fill(`First year ${suffix}`);
    await dialog.getByLabel('Display order').fill('1');
    await dialog.getByRole('button', { name: 'Add programme level' }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Add specialization' }).click();
    await dialog.getByLabel('Department').selectOption({ label: `Units ${suffix} (DEP-${suffix})` });
    await dialog.getByLabel('Code', { exact: true }).fill('COMP');
    await dialog.getByLabel('Specialization name').fill(track);
    await dialog.getByRole('button', { name: 'Add specialization' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('row').filter({ hasText: track }).getByRole('button', { name: /Manage/ }))
        .toHaveAccessibleName(/COMP/);

    const openPathway = page.getByRole('button', { name: 'Add pathway', exact: true });
    await openPathway.click();
    await dialog.getByLabel('Specialization').selectOption({ label: specializationOption });
    await dialog.getByLabel('Shared programme').selectOption({ label: programmeOption });
    await dialog.getByRole('button', { name: 'Add pathway' }).click();
    await expect(dialog).toHaveCount(0);

    await openPathway.click();
    await dialog.getByLabel('Specialization').selectOption({ label: specializationOption });
    await dialog.getByLabel('Shared programme').selectOption({ label: programmeOption });
    await dialog.getByRole('button', { name: 'Add pathway' }).click();
    const duplicate = dialog.getByRole('group', { name: 'Check your entries' });
    await expect(duplicate).toContainText('already been taken');
    await expect(duplicate).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(openPathway).toBeFocused();

    await page.reload();
    const pathway = page.getByRole('row').filter({ hasText: track }).filter({ hasText: programme });
    await expect(pathway).toContainText(`Units ${suffix} (DEP-${suffix})`);
    await expect(pathway).toContainText(programmeOption);
    await expect(page.getByRole('row').filter({ hasText: `First year ${suffix}` })).toContainText(programmeOption);
    await verifyRegisterHeaderContrast(page);
    const viewport = page.viewportSize()!;
    if (suffix === 'phone') {
        await page.setViewportSize({ width: 320, height: viewport.height });
        await verifyRegisterKeyboardScroll(page);
    }

    await verifyStaleLevelCorrection(
        page,
        `First year ${suffix}`,
        programmeOption,
        capture.replace('academic-pathways.png', 'stale-register-drawer.png'),
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.getByRole('heading', { name: 'Academic pathways', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: capture, animations: 'disabled' });
    await page.setViewportSize(viewport);
}

async function verifyStaleLevelCorrection(page: Page, label: string, programme: string, capture: string) {
    const dialog = page.getByRole('dialog');
    const row = page.getByRole('row').filter({ hasText: label }).filter({ hasText: programme });
    const manage = row.getByRole('button', { name: /Manage/ });
    await expect(manage).toHaveAccessibleName(/100/);
    await manage.click();
    await dialog.getByLabel('Display order').fill('2');

    const other = await page.context().newPage();
    try {
        await other.goto(page.url());
        await other.getByRole('row').filter({ hasText: label }).filter({ hasText: programme })
            .getByRole('button', { name: /Manage/ }).click();
        const editor = other.getByRole('dialog');
        await editor.getByLabel('Level label').fill(`${label} corrected`);
        await editor.getByRole('button', { name: 'Save changes' }).click();
        await expect(editor).toHaveCount(0);
    } finally {
        await other.close();
    }

    await dialog.getByRole('button', { name: 'Save changes' }).click();
    const feedback = dialog.getByRole('group', { name: 'Check your entries' });
    await expect(feedback).toContainText('This record changed while you were editing.');
    await expect(feedback).toBeFocused();
    await expect(feedback).toBeInViewport();
    await expect(dialog.getByLabel('Display order')).toHaveValue('2');
    expect(await dialog.evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(
        await dialog.evaluate(element => element.clientWidth),
    );
    await page.screenshot({ path: capture, animations: 'disabled' });
    await page.keyboard.press('Escape');
    const updated = page.getByRole('row').filter({ hasText: `${label} corrected` });
    await expect(updated.getByRole('cell', { name: '1', exact: true })).toBeVisible();
    await updated.getByRole('button', { name: /Manage/ }).click();
    await expect(dialog.getByLabel('Level label')).toHaveValue(`${label} corrected`);
    await verifyPendingRegisterSave(page, dialog);
    await expect(updated.getByRole('cell', { name: '3', exact: true })).toBeVisible();
}
