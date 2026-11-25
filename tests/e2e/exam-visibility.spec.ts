import { expect, test, type Page } from '@playwright/test';
import { loginWithPassword, openPaper, paper } from './exam-fixture';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

test.use({ serviceWorkers: 'block' });

async function hide(page: Page) {
    await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
    });
}

test('replays a committed signal after a lost response and reload', async ({ page }, info) => {
    const learner = `exam-learner-${info.project.name}`;
    const { db, attempt } = paper(learner);
    try {
        await openPaper(page, learner, attempt);
        const ids: string[] = [];
        await page.route(`**/attempts/${attempt}/visibility-signal`, async route => {
            const body = route.request().postDataJSON();
            expect(Object.keys(body)).toEqual(['observation_id']);
            ids.push(body.observation_id);
            if (ids.length === 1) {
                expect((await route.fetch()).status()).toBe(204);
                await route.abort('failed');
            } else await route.continue();
        });
        const failure = page.waitForEvent('requestfailed', req => req.url().endsWith('/visibility-signal'));
        await hide(page);
        await failure;
        const ack = page.waitForResponse(resp => resp.url().endsWith('/visibility-signal') && resp.status() === 204);
        await page.reload();
        await ack;
        await expect.poll(() => page.evaluate(key => sessionStorage.getItem(key), `exam-visibility:${attempt}`)).toBeNull();
        expect(ids).toEqual([ids[0], ids[0]]);
        const result = db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE attempt_id=? AND action='exam.page_hidden'`).get(attempt);
        expect(result?.n).toBe(1);
    } finally {
        db.close();
    }
});

test('bounds transient retries and reports an unconfirmed delivery', async ({ page }, info) => {
    const learner = `exam-learner-${info.project.name}`;
    const { db, attempt } = paper(learner);
    try {
        await openPaper(page, learner, attempt);
        const ids: string[] = [];
        await page.route(`**/attempts/${attempt}/visibility-signal`, async route => {
            ids.push(route.request().postDataJSON().observation_id);
            await route.fulfill({ status: 503 });
        });
        await hide(page);
        await expect(page.getByRole('status').filter({ hasText: 'could not be confirmed' })).toBeVisible({ timeout: 22000 });
        await page.evaluate(() => window.dispatchEvent(new Event('online')));
        expect(ids).toHaveLength(4);
        expect(new Set(ids).size).toBe(1);
    } finally {
        db.close();
    }
});

test('keeps an offline observation scoped to its attempt and shows receipt time after recovery', async ({ page, context, browser }, info) => {
    const learner = `exam-learner-${info.project.name}`;
    const reviewer = `exam-reviewer-${info.project.name}`;
    const staff = await browser.newPage({ baseURL: info.project.use.baseURL, viewport: info.project.use.viewport });
    const first = paper(learner);
    const second = paper(learner);
    const key = `exam-visibility:${first.attempt}`;
    try {
        await loginWithPassword(staff, reviewer);
        const otp = execFileSync('php', ['-r',
            'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
            resolve(process.env.PORTAL_E2E_RUN!, `${reviewer}.factor`)], { encoding: 'utf8' });
        await staff.getByLabel('Authenticator code').fill(otp);
        await staff.getByRole('button', { name: /verify code/i }).click();
        await expect(staff).toHaveURL(/\/dashboard$/);
        await openPaper(page, learner, first.attempt);
        await context.setOffline(true);
        await hide(page);
        const stored = await page.evaluate(key => sessionStorage.getItem(key), key);
        const pending = JSON.parse(stored!);
        expect(Object.keys(pending).sort()).toEqual(['id', 'sends']);
        expect(pending.sends).toBe(0);
        await staff.goto(`/examinations/${first.exam}/integrity`);
        await expect(staff.getByText('No observations recorded.')).toBeVisible();
        const ack = page.waitForResponse(resp => resp.url().endsWith(`${first.attempt}/visibility-signal`) && resp.status() === 204);
        await context.setOffline(false);
        await ack;
        await expect.poll(() => page.evaluate(key => sessionStorage.getItem(key), key)).toBeNull();
        expect(JSON.parse(first.db.prepare('SELECT visibility_receipts FROM examination_attempts WHERE id=?').get(first.attempt)?.visibility_receipts as string)).toEqual([pending.id]);
        await staff.reload();
        const observation = staff.getByRole('article').filter({ has: staff.getByRole('heading', { name: `EXAM/${info.project.name} · Attempt 1` }) });
        await expect(observation.getByText(/^Report received ·/)).toBeVisible();
        await expect(staff.getByText(/If the learner was offline, the page may have become hidden earlier/)).toBeVisible();
        const audit = first.db.prepare("SELECT occurred_at FROM audit_logs WHERE attempt_id=? AND action='exam.page_hidden'").get(first.attempt);
        const displayed = await observation.locator('time').getAttribute('datetime');
        expect(Date.parse(displayed!)).toBe(Date.parse(`${audit?.occurred_at}Z`));
        // A receipt for a different paper in the same tab is never drained by this paper.
        await page.goto(`/attempts/${second.attempt}`);
        await page.evaluate(([key, value]) => sessionStorage.setItem(key, value), [key, stored!]);
        await page.reload();
        await expect(page.getByLabel('Exam conditions')).toBeVisible();
        expect(await page.evaluate(key => sessionStorage.getItem(key), key)).toBe(stored);
        // Reload may itself hide the second paper, generating its own legitimate receipt.
        const other = second.db.prepare('SELECT visibility_receipts FROM examination_attempts WHERE id=?').get(second.attempt);
        expect(JSON.parse((other?.visibility_receipts as string | null) ?? '[]')).not.toContain(pending.id);
    } finally {
        await staff.close();
        first.db.close();
        second.db.close();
    }
});
