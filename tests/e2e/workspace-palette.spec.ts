import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/admin/overview');
    await page.getByRole('button', { name: 'Search', exact: true }).focus();
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('textbox', { name: 'Search screens' })).toBeFocused();
});

test('shortcut closes search, restores focus and clears the previous query', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Search workspace screens' });
    const input = dialog.getByRole('textbox');
    const trigger = page.getByRole('button', { name: 'Search', exact: true });
    await input.fill('no-such-workspace-screen');
    await expect(dialog.getByRole('status')).toHaveText('No screen matches that search.');
    await expect(dialog.getByRole('link')).toHaveCount(0);
    await input.press('Enter');
    await expect(input).toBeFocused();
    await expect(page).toHaveURL(/\/admin\/overview$/);
    await input.press('Control+k');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.press('Enter');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('');
    await input.press('Escape');
    await expect(trigger).toBeFocused();
});

test('dashboard results distinguish roles on a separate line and open the keyboard selection', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Search workspace screens' });
    const input = dialog.getByRole('textbox');
    await input.fill('Dashboard');
    const results = dialog.getByRole('link');
    await expect(results).toHaveCount(3);
    for (const role of ['Super Admin', 'Lecturer', 'Student']) {
        const result = results.filter({ hasText: role });
        await expect(result).toBeVisible();
        expect(await result.innerText()).toMatch(new RegExp(`^Dashboard\\s*\\n\\s*${role}$`));
    }

    await input.press('ArrowDown');
    await expect(results.first()).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(input).toBeFocused();
    await input.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(results.filter({ hasText: 'Lecturer' })).toBeFocused();
    const visit = page.waitForResponse(response => response.url().endsWith('/lecturer/overview') &&
        response.request().headers()['x-inertia'] === 'true');
    await page.keyboard.press('Enter');
    expect((await (await visit).json()).component).toBe('Lecturer/Overview');
    await expect(page).toHaveURL(/\/lecturer\/overview$/);
    await expect(dialog).toBeHidden();
});
