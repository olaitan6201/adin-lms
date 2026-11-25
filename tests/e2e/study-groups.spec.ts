import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

function lecturerCode(login: string): string {
    const run = process.env.PORTAL_E2E_RUN;

    if (!run) {
        throw new Error('Missing browser fixture directory.');
    }

    return execFileSync('php', [
        '-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        join(run, `${login}.factor`),
    ], { encoding: 'utf8' });
}

async function signIn(page: Page, login: string): Promise<void> {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(`${login}@demo.example.test`);
    await page.locator('input[name="password"]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/security\/challenge$/);
    await page.getByLabel('Authenticator code').fill(lecturerCode(login));
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
}

test('lecturer study-group history is reachable at the shared anchor', async ({ page }, info) => {
    const name = `${info.project.name} study group`;
    const renamed = `${name} revised`;

    await signIn(page, `group-${info.project.name}`);
    await page.goto('/courses');
    const course = page.locator('a[href^="/courses/"]').first();
    await expect(course).toBeVisible();
    const href = await course.getAttribute('href');
    const offering = href?.match(/\/courses\/([^/?#]+)/)?.[1];

    if (!offering) {
        throw new Error('Course link did not contain an offering UUID.');
    }

    await page.goto(`/community/courses/${offering}#study-groups`);
    await expect(page.locator('#study-groups')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Study groups', exact: true })).toBeVisible();

    await page.getByText('New study group', { exact: true }).click();
    const create = page.locator('details').filter({has: page.getByText('New study group', {exact: true})});
    await create.getByLabel('Group name').fill(name);
    await create.getByLabel('Ada Demo', { exact: true }).check();
    await page.getByRole('button', { name: 'Create study group', exact: true }).click();
    await expect(page.getByText(`${name} · Edit membership`, { exact: true })).toBeVisible();

    await page.getByText(`${name} · Edit membership`, { exact: true }).focus();
    await page.keyboard.press('Enter');
    const editor = page.locator('details').filter({has: page.getByText(`${name} · Edit membership`, {exact: true})});
    await editor.getByText('Membership history', { exact: true }).click();
    await expect(page.getByText(`Created as “${name}”.`, { exact: true })).toBeVisible();

    await editor.getByLabel('Group name').fill(renamed);
    await editor.getByLabel('Ada Demo', { exact: true }).uncheck();
    await editor.getByRole('button', { name: 'Save membership', exact: true }).click();
    await expect(page.getByText(`${renamed} · Edit membership`, { exact: true })).toBeVisible();
    await expect(page.getByText(`Renamed from “${name}” to “${renamed}”.`, { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Removed', exact: true })).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({
        path: `.agent-work/evidence/study-groups-${info.project.name}.png`,
        fullPage: true,
    });
});
