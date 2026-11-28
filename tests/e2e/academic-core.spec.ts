import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { verifyCourseEditorKeyboard } from './academic-core-accessibility';
import { configureAcademicPathway } from './academic-core-structure-fixture';

const workspace = '/admin/academic-core';

async function openEditor(page: Page, title: string) {
    const summary = page.locator('summary').filter({ hasText: new RegExp(`^${title}$`) });
    const details = summary.locator('..');
    if (!(await details.evaluate(element => (element as HTMLDetailsElement).open))) {
        await summary.press('Enter');
    }

    return details;
}

async function signIn(page: Page, suffix: string) {
    const role = `academic-core-${suffix}`;
    await page.goto(workspace);
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('[name=email]').fill(`${role}@demo.example.test`);
    await page.locator('[name=password]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    const code = execFileSync('php', [
        '-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        join(process.env.PORTAL_E2E_RUN!, `${role}.factor`),
    ], { encoding: 'utf8' });
    await page.getByLabel('Authenticator code').fill(code);
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(/\/admin\/overview$/);
}

test('reviews a revision, publishes a pathway curriculum and records adoption', async ({ page }, info) => {
    test.setTimeout(105_000);
    const suffix = info.project.name;
    await signIn(page, suffix);
    await page.goto(workspace);
    if (suffix === 'desktop') {
        await expect(page.getByText('No curriculum version records are available.')).toBeVisible();
    }

    const fixture = await configureAcademicPathway(page, suffix);
    await page.goto(workspace);
    await expect(page.getByRole('heading', { name: 'Academic core', exact: true, level: 1 })).toBeVisible();
    const courseCode = `QA-CORE-${suffix}`;
    const title = `Confirmed course revision ${suffix}`;

    const course = await openEditor(page, 'New course identity');
    await verifyCourseEditorKeyboard(page, course);
    await course.getByLabel('Department', { exact: true }).selectOption({ label: fixture.department });
    await course.getByLabel('Course code').fill(courseCode);
    await course.getByRole('button', { name: 'Add course', exact: true }).press('Enter');
    await expect(page).toHaveURL(/course=/);
    const revisionEditor = await openEditor(page, 'New course revision');
    await revisionEditor.getByLabel('Title', { exact: true }).fill(title);
    await revisionEditor.getByLabel('Description', { exact: true }).fill('Course catalogue content.');
    await revisionEditor.getByLabel('Standard units').fill('3.25');
    await revisionEditor.getByRole('button', { name: 'Add revision', exact: true }).click();
    await openEditor(page, 'Review draft revision');
    await page.getByRole('button', { name: 'Mark revision reviewed' }).click();
    await openEditor(page, 'Approve reviewed revision');
    await page.getByRole('button', { name: 'Approve revision', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Approve revision', exact: true })).toHaveCount(0);
    const duplicate = await openEditor(page, 'New course identity');
    await duplicate.getByLabel('Department', { exact: true }).selectOption({ label: fixture.department });
    await duplicate.getByLabel('Course code').fill(courseCode);
    await duplicate.getByRole('button', { name: 'Add course', exact: true }).click();
    const errors = duplicate.getByRole('group', { name: 'Check your entries' });
    await expect(errors).toContainText(/already in use|already been taken/);
    await expect(errors).toBeFocused();

    const curriculum = await openEditor(page, 'New pathway curriculum');
    const pathway = curriculum.getByLabel('Academic pathway');
    const pathwayOption = pathway.getByRole('option').filter({ hasText: fixture.specialization });
    await pathway.selectOption(await pathwayOption.getAttribute('value') as string);
    await curriculum.getByLabel('Framework revision').fill('Framework 2030');
    await curriculum.getByRole('button', { name: 'Start pathway curriculum' }).click();
    await expect(page).toHaveURL(/curriculum=/);

    const assignment = await openEditor(page, 'Assign an approved course revision');
    const revision = assignment.getByLabel('Course revision');
    const revisionOption = revision.getByRole('option').filter({ hasText: title });
    await revision.selectOption(await revisionOption.getAttribute('value') as string);
    const level = assignment.getByLabel('Programme level');
    const levelOption = level.getByRole('option').filter({ hasText: fixture.level });
    await level.selectOption(await levelOption.getAttribute('value') as string);
    await assignment.getByLabel('Category', { exact: true }).selectOption('core');
    await assignment.getByLabel('Requirement mode').selectOption('individual');
    await assignment.getByLabel('Effective units').fill('3.25');
    await assignment.getByLabel('Semester position').fill('1');
    await assignment.getByRole('button', { name: 'Add assignment' }).click();
    await expect(page.getByRole('row').filter({ hasText: title })).toContainText('3.25');
    await openEditor(page, 'Review draft curriculum');
    await page.getByRole('button', { name: 'Mark curriculum reviewed' }).click();
    await openEditor(page, 'Approve reviewed curriculum');
    await page.getByRole('button', { name: 'Approve curriculum' }).click();
    await expect(page.getByRole('button', { name: 'Add assignment' })).toHaveCount(0);

    const versionUrl = page.url();
    const cohort = await openEditor(page, 'New entry cohort');
    await cohort.getByLabel('Code', { exact: true }).fill(`INTAKE-${suffix}`);
    await cohort.getByLabel('Label', { exact: true }).fill(`Intake ${suffix}`);
    await cohort.getByRole('button', { name: 'Add cohort', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/academic-core/);
    await page.goto(versionUrl);
    const adoption = await openEditor(page, 'New adoption decision');
    await adoption.getByLabel('Academic session').selectOption({ index: 1 });
    const cohorts = adoption.getByLabel('Entry cohort');
    const cohortOption = cohorts.getByRole('option').filter({ hasText: `Intake ${suffix}` });
    await cohorts.selectOption(await cohortOption.getAttribute('value') as string);
    await adoption.getByLabel('Decision reference').fill(`DECISION-${suffix}`);
    await adoption.getByLabel('Reason').fill('Approved for the new cohort.');
    await adoption.getByRole('button', { name: 'Record adoption' }).click();
    await expect(page.getByText(`DECISION-${suffix}`, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(`DECISION-${suffix}`, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.screenshot({ path: info.outputPath('academic-core-adoption.png'), animations: 'disabled' });

    const fork = await openEditor(page, 'Revise approved curriculum');
    await fork.getByRole('button', { name: 'Fork as draft' }).click();
    await expect(page).not.toHaveURL(versionUrl);
    const edit = await openEditor(page, `Edit assignment for ${courseCode}`);
    await expect(edit.getByLabel('Effective units')).toHaveValue(/^3\.25(?:0+)?$/);
    await edit.getByLabel('Effective units').fill('4.125');
    await edit.getByRole('button', { name: 'Save assignment changes' }).click();
    await expect(page.getByRole('row').filter({ hasText: title })).toContainText('4.125');
    await expect(page.getByText(`Updated the assignment for ${courseCode}.`)).toContainText('effective units: 3.25 → 4.125');
    await expect(page.getByRole('link', { name: 'Open source version 1' })).toHaveAttribute('href', new URL(versionUrl).pathname + new URL(versionUrl).search);
    await page.goto(versionUrl);
    await expect(page.getByRole('row').filter({ hasText: title })).toContainText('3.25');
    await expect(page.getByText(`DECISION-${suffix}`, { exact: true })).toBeVisible();
});
