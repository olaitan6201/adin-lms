import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { examDatabase, loginWithPassword, questions } from './exam-fixture';

test.use({ timezoneId: 'America/Los_Angeles', serviceWorkers: 'block' });

async function signIn(page: Page, role: string) {
    await loginWithPassword(page, role);
    const otp = execFileSync('php', ['-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        resolve(process.env.PORTAL_E2E_RUN!, `${role}.factor`)], { encoding: 'utf8' });
    await page.getByLabel('Authenticator code').fill(otp);
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
}

test('separates slot controls, adds exact points and persists the UTC interval from a Pacific device', async ({ page }, info) => {
    const db = examDatabase();
    try {
        const item = randomUUID();
        const topic = `Topic ${item}`;
        questions(db, topic);
        db.prepare(`INSERT INTO assessment_items (id,gradebook_id,title,kind,weight_percent,maximum_score)
            SELECT ?,gradebook_id,'Fractional paper','exam',0,0.3 FROM assessment_items WHERE title='Computing reflection'`).run(item);
        await signIn(page, `exam-setup-${info.project.name}`);
        await page.goto(`/assessment-items/${item}/questions/select`);
        await page.getByLabel('Opens (UTC)').fill('2027-01-05T01:30');
        await page.getByLabel('Closes (UTC)').fill('2027-01-05T02:30');
        await expect(page.getByRole('status').filter({ hasText: 'America/Los_Angeles' })).toContainText('Jan 4, 2027');
        const row = page.getByRole('article').filter({ hasText: topic }).filter({ hasText: 'First prompt' });
        await row.getByRole('checkbox').check();
        const fixed = row.getByLabel('Possible points');
        await fixed.fill('0.1');
        const add = page.getByRole('button', { name: 'Add random slot' });
        const remove = page.getByRole('button', { name: 'Remove last random slot' });
        await add.press('Enter');
        await page.getByLabel('Topic for draw 1').selectOption({ label: topic });
        const draw = page.getByLabel('Points for draw 1');
        await draw.fill('1000000');
        await expect(page.getByText(/Selected total: 1000000\.1 \//)).toBeVisible();
        await draw.fill('1000000.00000001');
        await expect(page.getByText(/Enter points greater than zero/)).toBeVisible();
        await draw.fill('0.000000001');
        await expect(page.getByText(/Enter points greater than zero/)).toBeVisible();
        await draw.fill('0.00000001');
        await expect(page.getByText(/Selected total: 0\.10000001 \//)).toBeVisible();
        for (const width of [320, 390]) {
            await page.setViewportSize({ width, height: 844 });
            await draw.press('Tab');
            await expect(add).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(remove).toBeFocused();
            const a = (await add.boundingBox())!;
            const b = (await remove.boundingBox())!;
            expect(b.x >= a.x + a.width + 8 || b.y >= a.y + a.height + 8).toBeTruthy();
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        }
        await remove.press('Enter');
        await expect(page.getByText(/Selected total: 0\.1 \//)).toBeVisible();
        await add.press('Enter');
        await page.getByLabel('Topic for draw 1').selectOption({ label: topic });
        await draw.fill('0.2');
        await expect(page.getByText('Selected total: 0.3 / 0.3 points')).toBeVisible();
        await page.getByRole('button', { name: 'Create examination from selection' }).click();
        await expect(page.getByRole('heading', { name: 'Assessments and results' })).toBeVisible();
        expect(db.prepare('SELECT opens_at,closes_at FROM examinations WHERE item_id=?').get(item)).toEqual({
            opens_at: '2027-01-05 01:30:00', closes_at: '2027-01-05 02:30:00',
        });
        expect(db.prepare('SELECT points FROM exam_slots WHERE exam_id=(SELECT id FROM examinations WHERE item_id=?) ORDER BY position').all(item)).toEqual([{ points: 0.1 }, { points: 0.2 }]);
    } finally {
        db.close();
    }
});

test('officer can choose between same-title offering links by their accessible names', async ({ page }) => {
    await signIn(page, 'exam-office');
    await page.goto('/examinations-office');
    const name = 'Introduction to Computing · DEMO-CSC101-2026-';
    await expect(page.getByRole('link', { name: `${name}1`, exact: true })).toBeVisible();
    const second = page.getByRole('link', { name: `${name}2`, exact: true });
    const target = await second.getAttribute('href');
    await second.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await expect(page.getByRole('heading', { name: 'Assessments and results' })).toBeVisible();
});
