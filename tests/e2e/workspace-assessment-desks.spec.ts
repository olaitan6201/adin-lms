import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('renaming an assignment to a duplicate title does not borrow another course’s scripts', async ({ page }) => {
    await page.goto('/lecturer/assignments');
    const title = 'Journal entry and trial balance problem set';
    const english = page.getByRole('row').filter({ hasText: 'ENG210' });
    const dialog = page.getByRole('dialog');
    await english.getByRole('button', { name: 'Edit' }).click();
    await expect(dialog).toContainText('no notification or audit entry is created');
    await dialog.getByLabel('Closes').fill('2026-11-21T12:30');
    await dialog.getByLabel('Title', { exact: true }).fill(title);
    await dialog.getByLabel('Instructions', { exact: true }).fill('Submit the essay.');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(english).toContainText(title);
    await expect(english).toContainText('2026-11-21 12:30');
    await english.getByRole('button', { name: 'Mark', exact: true }).click();
    await expect(page.getByText('No submissions for this assignment.')).toBeVisible();
    await expect(page.getByText('0 submissions shown')).toBeVisible();
    await page.getByRole('navigation', { name: 'Page sections' }).getByRole('button', { name: /Assignments/ }).click();
    const accounting = page.getByRole('row').filter({ hasText: title }).filter({ hasText: 'ACC302' });
    await accounting.getByRole('button', { name: 'Mark', exact: true }).click();
    await expect(dialog).toHaveAccessibleName('Blessing Okonkwo');
    await dialog.getByRole('button', { name: 'Return to student' }).click();
    await expect(accounting).toContainText('66%');
    await expect(page.getByText(/they do not create an institutional audit record/)).toBeVisible();
    await expect(english).toContainText('0%');
    await page.getByRole('button', { name: /Marking queue/ }).click();
    await expect(page.getByText('33 awaiting')).toBeVisible();
    await page.getByRole('navigation', { name: 'Page sections' }).getByRole('button', { name: /Assignments/ }).click();
    await accounting.getByRole('button', { name: 'Mark', exact: true }).click();
    await dialog.getByRole('button', { name: 'Return to student' }).click();
    await expect(accounting).toContainText('66%');
});

test('a newly created bank starts empty and owns its added question', async ({ page }) => {
    await page.goto('/lecturer/cbt');
    await expect(page.getByText('404 questions')).toBeVisible();
    const dialog = page.getByRole('dialog');
    await page.getByRole('button', { name: 'New bank' }).click();
    await dialog.getByLabel('Bank name').fill('Revision essays');
    await dialog.getByLabel('Course').fill('ENG210');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog).toContainText('No records to display.');
    await dialog.getByRole('button', { name: 'Add question' }).click();
    await dialog.getByLabel('Stem').fill('Compare narrative voices.');
    await dialog.getByRole('button', { name: 'Save question' }).click();
    await expect(dialog).toContainText('Compare narrative voices.');
    await page.keyboard.press('Escape');
    await expect(page.getByText('405 questions')).toBeVisible();
    await page.getByRole('row').filter({ hasText: 'English literature comprehension' }).getByRole('button').click();
    await expect(dialog).not.toContainText('Compare narrative voices.');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /^Examinations/ }).click();
    const biology = page.getByRole('row').filter({ hasText: 'BSC205' });
    await biology.getByRole('button', { name: 'Blueprint' }).click();
    await dialog.getByLabel('Access window opens').fill('2026-12-01T10:00');
    await dialog.getByLabel('Access window closes').fill('2026-12-01T11:00');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(biology).toContainText('21 Nov 2026, 13:00');
    await biology.getByRole('button', { name: 'Blueprint' }).click();
    await expect(dialog.getByLabel('Access window opens')).toHaveValue('2026-12-01T10:00');
    await expect(dialog.getByLabel('Access window closes')).toHaveValue('2026-12-01T11:00');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('row').filter({ hasText: 'ACC302' })).toContainText('18 Nov 2026');
    await page.getByRole('button', { name: 'Schedule examination' }).first().click();
    await dialog.getByLabel('Examination', { exact: true }).fill('Winter sitting');
    await dialog.getByLabel('Course', { exact: true }).fill('ENG210');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Winter sitting' })).toContainText('ENG210');
});

test('a scheduled register discards cancelled marks and saves only the selected class', async ({ page }) => {
    await page.goto('/lecturer/attendance');
    const row = page.getByRole('row').filter({ hasText: 'BSC205' });
    const dialog = page.getByRole('dialog');
    const present = dialog.getByRole('group', { name: 'Chinedu Okafor' }).getByLabel('present', { exact: true });
    await row.getByRole('button').click();
    await present.check();
    await page.keyboard.press('Escape');
    await row.getByRole('button').click();
    await expect(present).not.toBeChecked();
    await present.check();
    await dialog.getByRole('button', { name: 'Save register' }).first().click();
    await expect(row.getByRole('cell').nth(2)).toHaveText('1');
    await row.getByRole('button').click();
    await expect(present).toBeChecked();
    await page.keyboard.press('Escape');
    await page.getByRole('row').filter({ hasText: 'ENG210' }).getByRole('button').click();
    await expect(dialog.getByRole('group', { name: 'Chinedu Okafor' }).getByLabel('late', { exact: true })).toBeChecked();
    await page.keyboard.press('Escape');
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Attendance report' }).first().click();
    const path = await (await downloaded).path();
    expect(await readFile(path!, 'utf8')).toContain('"Practical session: slide preparation","16 Nov 2026","1","0","0"');
});

test('all new assignment rules inherit the desk defaults and overrides stay with the assignment', async ({ page }) => {
    await page.goto('/lecturer/assignments');
    await page.getByRole('button', { name: /Marking queue/ }).click();
    await expect(page.getByText('34 awaiting', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Rules and feedback' }).click();
    const rules = {
        'Accepted formats': 'PDF only',
        'Maximum file size': '10 MB',
        'Late submission policy': 'Not accepted after closing',
        'Revision after submission': 'Not allowed',
        'Individual or group': 'Group',
    };
    for (const [label, value] of Object.entries(rules)) {
        await page.getByRole('combobox', { name: label, exact: true }).selectOption(value);
    }

    await page.getByRole('button', { name: 'New assignment' }).first().click();
    const dialog = page.getByRole('dialog');
    for (const [label, value] of Object.entries(rules)) {
        await expect(dialog.getByRole('combobox', { name: label, exact: true })).toHaveValue(value);
    }

    await dialog.getByLabel('Maximum file size').selectOption('50 MB');
    await dialog.getByLabel('Title').fill('Local override');
    await dialog.getByLabel('Instructions').fill('Submit one document.');
    await dialog.getByLabel('Closes').fill('2026-12-01T10:00');
    await dialog.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: /^Assignments/ }).click();
    await page.getByRole('row').filter({ hasText: 'Local override' }).getByRole('button', { name: 'Edit' }).click();
    await expect(dialog.getByLabel('Maximum file size')).toHaveValue('50 MB');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'New assignment' }).first().click();
    await expect(dialog.getByLabel('Maximum file size')).toHaveValue('10 MB');
});
