import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

test.use({ serviceWorkers: 'block' });

function paper(login: string) {
    const run = realpathSync(process.env.PORTAL_E2E_RUN!);
    if (!run.startsWith(realpathSync('.agent-work/browser-tests') + sep + 'run-')) {
        throw new Error('Disposable browser database required.');
    }
    const db = new DatabaseSync(realpathSync(resolve(run, 'portal.sqlite')));
    const item = randomUUID();
    const exam = randomUUID();
    const attempt = randomUUID();
    db.prepare(`INSERT INTO assessment_items (id,gradebook_id,title,kind,weight_percent,maximum_score)
        SELECT ?,gradebook_id,'Visibility paper','exam',0,10 FROM assessment_items WHERE title='Computing reflection'`).run(item);
    db.prepare(`INSERT INTO examinations (id,item_id,opens_at,closes_at,duration_seconds,max_attempts,shuffle_options,security_policy)
        VALUES (?,?,datetime('now','-1 hour'),datetime('now','+1 hour'),600,1,0,'{"observe_visibility":true}')`).run(exam, item);
    db.prepare(`INSERT INTO examination_attempts (id,exam_id,enrolment_id,ordinal,started_at,expires_at,state)
        SELECT ?,?,e.id,1,datetime('now'),datetime('now','+10 minutes'),'active' FROM enrolments e
        JOIN offerings o ON e.offering_id=o.id JOIN students s ON s.id=e.student_id JOIN users u ON u.id=s.user_id
        WHERE e.status='registered' AND o.external_offering_id='DEMO-CSC101-2026-1' AND u.email=?`).run(attempt, exam, `${login}@demo.example.test`);
    return { db, attempt };
}

async function hide(page: Page) {
    await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
    });
}

async function openPaper(page: Page, login: string, attempt: string) {
    await page.goto('/login');
    await page.locator('input[name=email]').fill(`${login}@demo.example.test`);
    await page.locator('input[name=password]').fill('password');
    await page.locator('input[name=password]').press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto(`/attempts/${attempt}`);
    await expect(page.getByLabel('Exam conditions')).toContainText('records when the page becomes hidden');
}

test('replays a committed signal after a lost response and reload', async ({ page }) => {
    const { db, attempt } = paper('ada');
    try {
        await openPaper(page, 'ada', attempt);
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

test('bounds transient retries and reports an unconfirmed delivery', async ({ page }) => {
    const { db, attempt } = paper('ada');
    try {
        await openPaper(page, 'ada', attempt);
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

test('keeps an offline observation in its own tab and attempt until it can be delivered', async ({ page, context }) => {
    const first = paper('ada');
    const second = paper('ada');
    const key = `exam-visibility:${first.attempt}`;
    try {
        await openPaper(page, 'ada', first.attempt);
        await context.setOffline(true);
        await hide(page);
        const stored = await page.evaluate(key => sessionStorage.getItem(key), key);
        const pending = JSON.parse(stored!);
        expect(Object.keys(pending).sort()).toEqual(['id', 'sends']);
        expect(pending.sends).toBe(0);
        const ack = page.waitForResponse(resp => resp.url().endsWith(`${first.attempt}/visibility-signal`) && resp.status() === 204);
        await context.setOffline(false);
        await ack;
        await expect.poll(() => page.evaluate(key => sessionStorage.getItem(key), key)).toBeNull();
        expect(JSON.parse(first.db.prepare('SELECT visibility_receipts FROM examination_attempts WHERE id=?').get(first.attempt)?.visibility_receipts as string)).toEqual([pending.id]);
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
        first.db.close();
        second.db.close();
    }
});
