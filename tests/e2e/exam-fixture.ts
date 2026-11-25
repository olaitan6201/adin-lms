import { expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function examDatabase() {
    const run = realpathSync(process.env.PORTAL_E2E_RUN!);
    if (!run.startsWith(realpathSync('.agent-work/browser-tests') + sep + 'run-')) {
        throw new Error('Disposable browser database required.');
    }
    return new DatabaseSync(realpathSync(resolve(run, 'portal.sqlite')));
}

export function paper(login: string) {
    const db = examDatabase();
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
    return { db, attempt, exam };
}

export async function loginWithPassword(page: Page, login: string) {
    await page.goto('/login');
    await page.locator('input[name=email]').fill(`${login}@demo.example.test`);
    await page.locator('input[name=password]').fill('password');
    await page.locator('input[name=password]').press('Enter');
}

export async function openPaper(page: Page, login: string, attempt: string) {
    await loginWithPassword(page, login);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto(`/attempts/${attempt}`);
    await expect(page.getByLabel('Exam conditions')).toContainText('records when the page becomes hidden');
}

export function questions(db: DatabaseSync, topic: string) {
    const bank = randomUUID();
    db.prepare("INSERT INTO question_banks SELECT ?,id,? FROM courses WHERE code='DEMO-CSC101'").run(bank, topic);
    return ['First prompt', 'Second prompt'].map(prompt => {
        const q = randomUUID();
        const version = randomUUID();
        db.prepare('INSERT INTO questions (id,bank_id) VALUES (?,?)').run(q, bank);
        db.prepare(`INSERT INTO question_versions (id,question_id,revision,kind,prompt) VALUES (?,?,1,'essay',?)`).run(version, q, prompt);
        return version;
    });
}
