import { expect, test } from '@playwright/test';

test('a replacement receipt stays with its assignment; closed work remains read-only', async ({ page }) => {
    await page.goto('/student/assignments');
    const dialog = page.getByRole('dialog');
    const english = page.getByRole('row').filter({ hasText: 'ENG210' });
    await english.getByRole('button').click();
    await expect(dialog).toContainText('narrative-voice.pdf');
    const picker = dialog.locator('input[type=file]');
    await picker.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('notes') });
    await dialog.getByRole('button', { name: 'Submit work' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Choose a PDF');
    await picker.setInputFiles({ name: 'revision.pdf', mimeType: 'application/pdf', buffer: Buffer.from('revision') });
    await dialog.getByRole('button', { name: 'Submit work' }).click();
    await expect(page.getByText(/Receipt RCP-.+ issued for revision.pdf/)).toBeVisible();
    await english.getByRole('button').click();
    await expect(dialog).toContainText('revision.pdf');
    await page.keyboard.press('Escape');
    await page.getByRole('row').filter({ hasText: 'BSC205' }).getByRole('button').click();
    await expect(dialog).toContainText('mitosis-observation.pdf');
    await expect(dialog.getByRole('button', { name: 'Submit work' })).toHaveCount(0);
});

test('the attempt restores a flagged written answer and becomes read-only on expiry', async ({ page }) => {
    await page.clock.install();
    await page.goto('/student/exam');
    await page.getByRole('button', { name: 'Question 7, Not answered' }).click();
    const answer = page.getByLabel('Answer for question 7');
    await answer.fill('Historic cost');
    await page.getByRole('button', { name: 'Mark for review' }).click();
    await page.reload();
    await expect(answer).toHaveValue('Historic cost');
    await expect(page.getByRole('button', { name: 'Question 7, Flagged' })).toHaveAttribute('aria-current', 'step');
    await page.getByRole('button', { name: 'Clear response' }).click();
    await expect(answer).toHaveValue('');
    await page.clock.fastForward('01:31:00');
    await expect(page.getByText('Access window expired')).toBeVisible();
    await expect(page.getByText('0 of 7', { exact: true })).toBeVisible();
    await expect(answer).toHaveCount(0);
});

test('unavailable storage blocks save and exit but keeps the current answer editable', async ({ page }) => {
    await page.addInitScript(() => {
        Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    });
    await page.goto('/student/exam');
    await expect(page.getByText('Local storage unavailable; keep this page open')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save and exit' })).toBeDisabled();
    await page.getByRole('radio').last().check();
    await expect(page.getByRole('radio').last()).toBeChecked();
});
