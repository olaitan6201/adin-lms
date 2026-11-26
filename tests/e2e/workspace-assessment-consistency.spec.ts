import { expect, test } from '@playwright/test';

test('changing shuffle preserves the selected sitting and its window across cancel and reopen', async ({ page }) => {
    await page.goto('/lecturer/cbt');
    await page.getByRole('button', { name: /^Examinations/ }).click();
    const biology = page.getByRole('row').filter({ hasText: 'BSC205' });
    const dialog = page.getByRole('dialog');
    await biology.getByRole('button').click();
    const opens = dialog.getByLabel('Access window opens');
    const closes = dialog.getByLabel('Access window closes');
    await expect(opens).toHaveValue('2026-11-21T13:00');
    await expect(closes).toHaveValue('2026-11-21T14:00');
    await opens.fill('2026-12-01T10:00');
    await page.keyboard.press('Escape');
    await biology.getByRole('button').click();
    await expect(opens).toHaveValue('2026-11-21T13:00');
    await dialog.getByLabel('Shuffle options').selectOption('No');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(biology).toContainText('21 Nov 2026, 13:00');
    await biology.getByRole('button').click();
    await expect(dialog.getByLabel('Shuffle options')).toHaveValue('No');
    await expect(opens).toHaveValue('2026-11-21T13:00');
    await expect(closes).toHaveValue('2026-11-21T14:00');
});

test('historical score survives feedback edits until a complete replacement breakdown is supplied', async ({ page }) => {
    await page.goto('/lecturer/assignments');
    await page.getByRole('button', { name: /Marking queue/ }).click();
    const aisha = page.getByRole('row').filter({ hasText: 'Aisha Bello' });
    const dialog = page.getByRole('dialog');
    await aisha.getByRole('button').click();
    await dialog.getByLabel('Written feedback').fill('Reviewed without regrading.');
    await dialog.getByRole('button', { name: 'Return to student' }).click();
    await expect(aisha.getByRole('cell').nth(4)).toHaveText('74');
    await aisha.getByRole('button').click();
    await expect(dialog).toContainText('No criterion marks recorded');
    await expect(dialog).toContainText('74 / 100');
    await dialog.getByRole('button', { name: 'Enter criterion marks' }).click();
    await dialog.getByLabel('Correct journal entry').fill('9');
    await expect(dialog.getByRole('button', { name: 'Return to student' })).toBeDisabled();
    await dialog.getByLabel('Correct ledger posting').fill('4');
    await dialog.getByLabel('Trial balance extracted and balanced').fill('2');
    await dialog.getByRole('button', { name: 'Return to student' }).click();
    await expect(aisha.getByRole('cell').nth(4)).toHaveText('75');
    await aisha.getByRole('button').click();
    await expect(dialog.getByLabel('Correct journal entry')).toHaveValue('9');
    await expect(dialog.getByLabel('Written feedback')).toHaveValue('Reviewed without regrading.');
    await page.keyboard.press('Escape');
    const chinedu = page.getByRole('row').filter({ hasText: 'Chinedu Okafor' });
    await chinedu.getByRole('button').click();
    await expect(dialog.getByRole('button', { name: 'Return to student' })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Enter criterion marks' }).click();
    await dialog.getByLabel('Correct journal entry').fill('0');
    await dialog.getByLabel('Correct ledger posting').fill('6');
    await dialog.getByLabel('Trial balance extracted and balanced').fill('4');
    await dialog.getByRole('button', { name: 'Return to student' }).click();
    await expect(chinedu.getByRole('cell').nth(4)).toHaveText('50');
});

test('student receipt badge, list, score and drawers agree for non-first assignments', async ({ page }) => {
    await page.goto('/student/assignments');
    await expect(page.getByText('0 outstanding')).toBeVisible();
    const biology = page.getByRole('row').filter({ hasText: 'BSC205' });
    await expect(biology).toContainText('74 / 100');
    const history = page.getByRole('listitem').filter({ hasText: 'Lab report: mitosis observation' });
    await expect(history).toContainText('Graded 74');
    await history.getByRole('button').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('mitosis-observation.pdf');
    await expect(dialog.getByRole('button', { name: 'Submit work' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.locator('article').filter({ hasText: 'Lab report: mitosis observation' }).getByRole('button', { name: 'Script' }).click();
    await expect(dialog).toContainText('74 / 100');
    await page.keyboard.press('Escape');
    const english = page.getByRole('listitem').filter({ hasText: 'Group presentation: narrative voice' });
    await english.getByRole('button').click();
    await expect(dialog).toContainText('narrative-voice.pdf');
    await dialog.locator('input[type=file]').setInputFiles({ name: 'revised.pdf', mimeType: 'application/pdf', buffer: Buffer.from('new') });
    await dialog.getByRole('button', { name: 'Submit work' }).click();
    await expect(page.getByText('0 outstanding')).toBeVisible();
    await page.getByRole('row').filter({ hasText: 'ENG210' }).getByRole('button').click();
    await expect(dialog).toContainText('revised.pdf');
    await page.keyboard.press('Escape');
    await english.getByRole('button').click();
    await expect(dialog).toContainText('revised.pdf');
});

test('register population label stays independent of first present and excused marks', async ({ page }) => {
    await page.goto('/lecturer/attendance');
    const scheduled = page.getByRole('row').filter({ hasText: 'BSC205' });
    const dialog = page.getByRole('dialog');
    await scheduled.getByRole('button').click();
    for (const mark of ['present', 'excused']) {
        await expect(dialog).toContainText('6 editable learners');
        await dialog.getByRole('group', { name: 'Aisha Bello' }).getByLabel(mark, { exact: true }).check();
        await dialog.getByRole('button', { name: 'Save register' }).first().click();
        await scheduled.getByRole('button').click();
        await expect(dialog.getByRole('group', { name: 'Aisha Bello' }).getByLabel(mark, { exact: true })).toBeChecked();
    }
    await expect(dialog).toContainText('6 editable learners');
});
