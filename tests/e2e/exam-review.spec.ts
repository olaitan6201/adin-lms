import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { openPaper, paper, questions } from './exam-fixture';

test.use({ serviceWorkers: 'block' });

test('only an explicit online confirmation submits the saved paper', async ({ page, context }, info) => {
    const learner = `exam-learner-${info.project.name}`;
    const { db, attempt } = paper(learner);
    try {
        questions(db, attempt).forEach((version, index) => {
            db.prepare(`INSERT INTO attempt_questions (id,attempt_id,position,version_id,option_order,possible_points)
                VALUES (?,?,?,?,'[]',5)`).run(randomUUID(), attempt, index + 1, version);
        });
        await openPaper(page, learner, attempt);
        const review = page.getByRole('button', { name: 'Review final submission' });
        const confirm = page.getByRole('button', { name: 'Submit final answers' });
        const dialog = page.getByRole('dialog');
        const draft = page.getByLabel('First prompt');
        await context.setOffline(true);
        await draft.fill('Current answer');
        await review.press('Enter');
        await expect(dialog).toContainText('0 answered · 2 unanswered');
        await expect(dialog).toContainText('offline');
        await expect(confirm).toBeDisabled();
        await expect(dialog.getByText('Return to paper')).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(review).toBeFocused();
        await expect(draft).toHaveValue('Current answer');
        await expect(page.getByText('Retry save')).toBeVisible();
        await context.setOffline(false);
        await review.press('Enter');
        await expect(dialog).toContainText('Wait for all answers to save');
        await expect(confirm).toBeDisabled();
        await page.keyboard.press('Enter');
        await page.getByText('Retry save').click();
        await review.press('Enter');
        await expect(dialog).toContainText('1 answered · 1 unanswered');
        await page.keyboard.press('Escape');
        expect(db.prepare('SELECT submitted_at FROM examination_attempts WHERE id=?').get(attempt)?.submitted_at).toBeNull();
        await review.press('Enter');
        await page.keyboard.press('Tab');
        await expect(confirm).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(draft).toBeDisabled();
        expect(db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE attempt_id=? AND action='exam.submitted'").get(attempt)?.n).toBe(1);
    } finally {
        db.close();
    }
});

test('deadline reached during review blocks confirmation; server closes expired paper', async ({ page }, info) => {
    const learner = `exam-learner-${info.project.name}`;
    const { db, attempt } = paper(learner);
    try {
        await page.clock.install();
        await openPaper(page, learner, attempt);
        await page.getByRole('button', { name: 'Review final submission' }).click();
        await page.clock.fastForward('11:00');
        await expect(page.getByRole('dialog')).toContainText('deadline has passed');
        await expect(page.getByText('Submit final answers')).toBeDisabled();
        db.prepare("UPDATE examination_attempts SET expires_at=datetime('now','-1 second') WHERE id=?").run(attempt);
        await page.reload();
        await expect(page.getByText(/Status: submitted/)).toBeVisible();
    } finally {
        db.close();
    }
});
