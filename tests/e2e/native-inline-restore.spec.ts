import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { join, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGMwLFuEFTEMLQkAB2hSQcEqELQAAAAASUVORK5CYII=', 'base64');
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

async function login(page: Page, login: string) {
    await page.goto('/login');
    await page.locator('[name=email]').fill(`${login}@demo.example.test`);
    await page.locator('[name=password]').fill('password');
    await page.locator('[name=password]').press('Enter');
}

test('a restored image appears once between the authored paragraphs for a target-only learner', async ({ page, browser }, info) => {
    test.setTimeout(120_000);
    const run = realpathSync(process.env.PORTAL_E2E_RUN!);
    if (!run.startsWith(realpathSync('.agent-work/browser-tests') + sep + 'run-')) throw new Error('Disposable test database required.');
    const author = `exchange-${info.project.name}`;
    const learner = `${author}-reader`;
    const { source, target, factor } = JSON.parse(readFileSync(join(run, `${author}.json`), 'utf8'));
    await login(page, author);
    const otp = execFileSync('php', ['-r', 'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(trim(stream_get_contents(STDIN)));'], { input: factor, encoding: 'utf8' });
    await page.getByLabel('Authenticator code').fill(otp);
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(/dashboard$/);
    await page.goto(`/courses/${source}/learning`);
    const trigger = page.getByRole('button', { name: 'Author a lesson', exact: true });
    const create = page.locator('[data-slot="collapsible"]').filter({ has: trigger });
    await trigger.click();
    await create.getByLabel('Title', { exact: true }).fill('Field plate');
    await create.getByLabel('Publication').selectOption('1');
    await create.getByRole('button', { name: 'Save lesson' }).click();
    const lesson = page.locator('section').filter({ has: page.getByRole('heading', { name: /1\. Field plate/ }) });
    await lesson.getByText('Add a resource', { exact: true }).click();
    await lesson.getByLabel('Resource title').fill('Sample image');
    await lesson.locator('[name=file]').setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: png });
    await lesson.getByRole('button', { name: 'Save revision' }).click();
    const original = await lesson.getByRole('img', { name: 'Sample image' }).getAttribute('src');
    await lesson.getByText('Edit lesson or publish', { exact: true }).click();
    const manuscript = lesson.locator('textarea[name=body][rows="10"]');
    await manuscript.fill('First observation');
    await lesson.getByLabel('Insert learning resource').selectOption({ label: 'Sample image' });
    await manuscript.fill((await manuscript.inputValue()) + 'Closing observation');
    await lesson.getByRole('button', { name: 'Save lesson' }).click();
    await expect(lesson.getByText('Closing observation', { exact: true })).toBeVisible();

    const backup = await page.request.get(`/operations/courses/${source}/export/native`);
    expect(backup.status()).toBe(200);
    const xsrf = (await page.context().cookies()).find(cookie => cookie.name === 'XSRF-TOKEN')!;
    const restored = await page.request.post(`/operations/courses/${target}/import`, {
        headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrf.value), Accept: 'application/json' },
        multipart: { package: { name: 'course.zip', mimeType: 'application/zip', buffer: await backup.body() } },
    });
    expect(restored.status(), await restored.text()).toBe(201);

    const db = new DatabaseSync(realpathSync(join(run, 'portal.sqlite')));
    try {
        db.prepare("UPDATE offerings SET status='published' WHERE id=?").run(target);
        db.prepare(`INSERT INTO enrolments (id, offering_id, student_id, status, source_revision, enrolled_at)
            SELECT ?, ?, s.id, 'registered', 1, CURRENT_TIMESTAMP FROM students s JOIN users u ON u.id=s.user_id WHERE u.email=?`)
            .run(crypto.randomUUID(), target, `${learner}@demo.example.test`);
    } finally {
        db.close();
    }
    const reader = await browser.newPage({ baseURL: info.project.use.baseURL, viewport: info.project.use.viewport });
    try {
        await login(reader, learner);
        await expect(reader).toHaveURL(/dashboard$/);
        await reader.goto(`/courses/${target}/learning`);
        const image = reader.getByRole('img', { name: 'Sample image' });
        await expect(image).toHaveCount(1);
        await expect(image).toBeVisible();
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('naturalWidth', 8);
        const block = reader.locator('article').filter({ has: image });
        await expect(block.locator('xpath=preceding-sibling::*[1]')).toHaveText('First observation');
        await expect(block.locator('xpath=following-sibling::*[1]')).toHaveText('Closing observation');
        const url = await image.getAttribute('src');
        expect(url).toContain(`/courses/${target}/learning/files/`);
        const bytes = await reader.request.get(url!);
        expect(bytes.status()).toBe(200);
        expect(hash(await bytes.body())).toBe(hash(png));
        expect((await reader.request.get(original!)).status()).toBe(404);
        expect((await reader.request.get(`/courses/${source}/learning`)).status()).toBe(404);
    } finally {
        await reader.close();
    }
});
