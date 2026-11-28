import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { expect, type Browser, type Locator, type Page } from '@playwright/test';

export async function signIn(page: Page, role: string, destination: RegExp) {
    await page.goto('/login');
    await page.locator('[name=email]').fill(`${role}@demo.example.test`);
    await page.locator('[name=password]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    const code = execFileSync('php', [
        '-r',
        'require "vendor/autoload.php"; echo (new PragmaRX\\Google2FA\\Google2FA)->getCurrentOtp(file_get_contents($argv[1]));',
        join(process.env.PORTAL_E2E_RUN!, `${role}.factor`),
    ], { encoding: 'utf8' });
    await page.getByLabel('Authenticator code').fill(code);
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL(destination);
}

export async function tabTo(page: Page, target: Locator, limit = 40) {
    for (let step = 0; step < limit; step++) {
        if (await target.evaluateAll(nodes => nodes.some(node => node === document.activeElement))) {
            break;
        }

        await page.keyboard.press('Tab');
    }

    await expect(target).toBeFocused();
}

export async function primary(page: Page) {
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if ((page.viewportSize()?.width ?? 0) < 1024) {
        await expect(page.getByRole('dialog', { name: 'Portal menu' })).toBeHidden();
        await expect(menu).toBeVisible();
        await tabTo(page, menu, 75);
        await page.keyboard.press('Enter');
        await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();
    }

    return page.getByRole('navigation', { name: 'Primary', exact: true });
}

export async function activate(page: Page, target: Locator) {
    await tabTo(page, target);
    await page.keyboard.press('Enter');
}

export async function verifySecondPageReturn(page: Page, register: 'placements' | 'delivery-links', prefix: RegExp) {
    const isPlacement = register === 'placements';
    const item = isPlacement ? 'updates' : 'offerings';
    const list = page.getByRole('heading', { name: isPlacement ? 'Placement updates' : 'Published offerings', exact: true });
    const pageOne = `/admin/${register}`;
    const pageTwo = `${pageOne}?page=2`;
    await page.goto(pageOne);
    await activate(page, page.getByRole('link', { name: 'Skip to content', exact: true }));
    await activate(page, page.getByRole('link', { name: `Next ${item}`, exact: true }));
    await expect(page).toHaveURL(pageTwo);
    await expect(list).toBeFocused();
    const firstFixture = page.getByRole('link', { name: prefix }).first();
    const rowName = (await firstFixture.innerText()).split(isPlacement ? ' · Update' : '\n')[0].trim();
    const row = page.getByRole('link', { name: new RegExp(`^${rowName}(?:$|\\s)`) });
    const heading = page.getByRole('heading', {
        name: isPlacement ? `${rowName} · Update 1` : rowName,
        exact: true,
    });
    await activate(page, row);
    await expect(page).toHaveURL(new RegExp(`/admin/${register}/[a-f0-9-]+\\?page=2$`));
    const directDetail = new URL(page.url()).pathname;
    await expect(heading).toBeFocused();
    await expect(row).toHaveAttribute('aria-current', 'page');
    await expect(row).toContainText('Selected');
    const back = page.getByRole('link', {
        name: isPlacement ? 'Back to placement updates' : 'Back to published offerings',
        exact: true,
    });
    await activate(page, back);
    await expect(page).toHaveURL(pageTwo);
    await expect(row).toBeFocused();

    await page.goto(directDetail);
    await expect(heading).toBeVisible();
    await expect(row).toHaveCount(0);
    await activate(page, back);
    await expect(page).toHaveURL(pageOne);
    await expect(list).toBeFocused();
}

export async function expectEncryptedHistory(page: Page) {
    await expect.poll(() => page.evaluate(() => history.state?.page instanceof ArrayBuffer)).toBe(true);
    await expect.poll(() => page.evaluate(() => Boolean(sessionStorage.getItem('historyKey')))).toBe(true);
}

export async function verifyLogoutAndSwitch(
    page: Page,
    alternateActor: string,
    destination: RegExp,
    protectedUrl: string,
    sentinels: string[],
) {
    const body = page.locator('body');
    for (const sentinel of sentinels) {
        await expect(body).toContainText(sentinel);
    }

    await expectEncryptedHistory(page);
    await primary(page);
    await Promise.all([page.waitForURL('/login'), activate(page, page.getByRole('button', { name: 'Sign out' }))]);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('historyKey'))).toBeNull();
    await page.goBack();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await expectPrivateTextAbsent(body, sentinels);
    await signIn(page, alternateActor, destination);
    await page.goBack();
    await expectPrivateTextAbsent(body, sentinels);
    expect((await page.goto(protectedUrl))?.status()).toBe(403);
    await expectPrivateTextAbsent(body, sentinels);
}

async function expectPrivateTextAbsent(body: Locator, sentinels: string[]) {
    for (const sentinel of sentinels) {
        await expect(body).not.toContainText(sentinel);
    }
}

export async function verifyGuestExpiry(browser: Browser, start: Page, project: string, protectedUrl: string, student: string) {
    const page = await browser.newPage({
        viewport: start.viewportSize()!,
        hasTouch: project === 'phone',
    });
    try {
        await signIn(page, `registrar-expiry-${project}`, /\/admin\/placements$/);
        await page.goto(protectedUrl);
        const sentinel = page.getByText(student, { exact: true });
        await expect(sentinel).toBeVisible();
        await expectEncryptedHistory(page);
        await page.context().clearCookies();
        await page.goto('/portal');
        await expect(page.getByRole('link', { name: 'Sign in to the portal' })).toBeVisible();
        await expect.poll(() => page.evaluate(() => sessionStorage.getItem('historyKey'))).toBeNull();
        await page.goBack();
        await expect(page).toHaveURL(/\/login$/);
        await expect(sentinel).toHaveCount(0);
        await page.goForward();
        await expect(page).not.toHaveURL(protectedUrl);
        await expect(sentinel).toHaveCount(0);
    } finally {
        await page.close();
    }
}
