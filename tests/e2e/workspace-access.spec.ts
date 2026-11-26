import { expect, test } from '@playwright/test';

test('workspace sign-in and recovery use local feedback without sending identifiers or credentials', async ({ page }) => {
    const writes: string[] = [];
    page.on('request', request => {
        if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.url());
    });
    await page.goto('/auth/signin');
    await page.getByLabel('Matric number, staff ID or email').fill('sample-identifier');
    await page.getByLabel('Password', { exact: true }).fill('fixture-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'Sign-in submitted.' })).toBeVisible();
    await page.getByRole('link', { name: 'Forgotten your password?' }).press('Enter');
    await expect(page).toHaveURL(/\/auth\/recover$/);
    await page.getByRole('button', { name: 'Send recovery code' }).press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'Recovery code requested.' })).toBeVisible();
    await page.getByLabel('Recovery code', { exact: false }).fill('123456');
    await page.getByLabel(/New password/).fill('fixture-password-2');
    await page.getByRole('button', { name: 'Set new password' }).press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'No password was changed' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Access your learning record' })).toBeVisible();
    expect(writes).toEqual([]);
});
