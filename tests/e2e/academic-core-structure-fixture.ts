import { expect, type Page } from '@playwright/test';

export async function configureAcademicPathway(page: Page, suffix: string) {
    const programme = `Core test programme ${suffix}`;
    const programmeCode = `CORE-${suffix}`;
    const specialization = `Core test specialization ${suffix}`;
    const specializationCode = `TRACK-${suffix}`;
    const level = `Core test level ${suffix}`;
    const dialog = page.getByRole('dialog');
    const programmeOption = `${programme} (${programmeCode})`;
    await page.goto('/admin/structure');
    await page.getByRole('button', { name: 'Add shared programme', exact: true }).click();
    await dialog.getByLabel('Code', { exact: true }).fill(programmeCode);
    await dialog.getByLabel('Programme name').fill(programme);
    await dialog.getByRole('button', { name: 'Add shared programme' }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Add programme level' }).click();
    await dialog.getByLabel('Shared programme').selectOption({ label: programmeOption });
    await dialog.getByLabel('Code', { exact: true }).fill('100');
    await dialog.getByLabel('Level label').fill(level);
    await dialog.getByLabel('Display order').fill('1');
    await dialog.getByRole('button', { name: 'Add programme level' }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Add specialization' }).click();
    const selectDepartment = dialog.getByLabel('Department');
    await selectDepartment.selectOption({ index: 1 });
    const department = await selectDepartment.locator('option:checked').textContent();
    const departmentCode = department?.match(/\(([^()]+)\)$/)?.[1];
    expect(departmentCode).toBeTruthy();
    await dialog.getByLabel('Code', { exact: true }).fill(specializationCode);
    await dialog.getByLabel('Specialization name').fill(specialization);
    await dialog.getByRole('button', { name: 'Add specialization' }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Add pathway', exact: true }).click();
    await dialog.getByLabel('Shared programme').selectOption({ label: programmeOption });
    await dialog.getByLabel('Specialization').selectOption({
        label: `${specialization} (${specializationCode}) — ${departmentCode}`,
    });
    await dialog.getByRole('button', { name: 'Add pathway' }).click();
    await expect(dialog).toHaveCount(0);

    return { department: department!, programme, specialization, level };
}
