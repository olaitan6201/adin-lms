import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

test('a learner follows the prerequisite link and unlocks the next reading', async ({ page, browser }, info) => {
    const author = `group-${info.project.name}`;
    const learner = info.project.name === 'desktop' ? 'ada' : 'tunde';
    const prior = `Orientation · ${info.project.name}`;
    const next = `Field notes · ${info.project.name}`;
    await page.goto('/login');
    await page.locator('[name=email]').fill(`${author}@demo.example.test`);
    await page.locator('[name=password]').fill('password');
    await page.locator('[name=password]').press('Enter');
    const otp = execFileSync('php', ['-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        join(process.env.PORTAL_E2E_RUN!, `${author}.factor`)], { encoding: 'utf8' });
    await page.getByLabel('Authenticator code').fill(otp);
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(/dashboard$/);
    await page.goto('/courses');
    const href = await page.locator('a[href^="/courses/"]').first().getAttribute('href');
    const content = `${href}/learning`;
    await page.goto(content);
    for (const title of [prior, next]) {
        const create = page.locator('details').filter({ has: page.getByText('Author a lesson', { exact: true }) });
        await create.locator('summary').first().press('Enter');
        await create.getByLabel('Title', { exact: true }).fill(title);
        await create.getByLabel('Publication').selectOption('1');
        if (title === next) {
            await create.getByLabel('Require completion of').selectOption({
                label: await create.locator('option').filter({ hasText: prior }).innerText(),
            });
            await create.locator('[name=body]').fill('Measure the stream depth.');
        }
        await create.getByRole('button', { name: 'Save lesson' }).press('Enter');
        await expect(page.getByRole('heading', { name: new RegExp(title) })).toBeVisible();
    }

    const student = await browser.newPage({ baseURL: info.project.use.baseURL, viewport: info.project.use.viewport });
    try {
        await student.goto('/login');
        await student.locator('[name=email]').fill(`${learner}@demo.example.test`);
        await student.locator('[name=password]').fill('password');
        await student.locator('[name=password]').press('Enter');
        await expect(student).toHaveURL(/dashboard$/);
        await student.goto(content);
        const section = (title: string) => student.locator('section').filter({ has: student.getByRole('heading', { name: new RegExp(title) }) });
        const locked = section(next);
        await expect(locked.getByRole('button')).toHaveCount(0);
        await expect(locked.getByText('Measure the stream depth.')).toHaveCount(0);
        await locked.getByRole('link', { name: prior }).press('Enter');
        await expect(student).toHaveURL(/#lesson-/);
        await section(prior).getByRole('button', { name: 'Mark lesson complete' }).press('Enter');
        await expect(locked.getByText('Measure the stream depth.')).toBeVisible();
        await expect(locked.getByRole('button', { name: 'Mark lesson complete' })).toBeVisible();
    } finally {
        await student.close();
    }
});
