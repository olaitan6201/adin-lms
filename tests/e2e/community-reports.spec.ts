import { expect, test } from '@playwright/test';

test('learner filters a completion report and replies from the course discussion', async ({ page }, info) => {
    const text = `Group recap ${info.project.name}`;
    await page.goto('/login');
    await page.locator('input[name=email]').fill('ada@demo.example.test');
    await page.locator('input[name=password]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login$/);
    await page.goto('/reports');
    await page.getByRole('link', { name: 'Course completion' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Course completion', exact: true })).toBeVisible();
    const select = page.getByLabel('Course offering');
    await select.selectOption({ label: 'DEMO-CSC101-2026-1' });
    const course = await select.inputValue();
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page).toHaveURL(new RegExp(`offering=${course}`));
    await expect(page.getByRole('row', { name: /Selection total/ })).toContainText('0.00%');
    await expect(page.getByRole('link', { name: 'Download Excel' })).toHaveAttribute('href', /family=completion/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.goto(`/community/courses/${course}`);
    await page.getByRole('link', { name: 'Computing seminar' }).click();
    await expect(page.getByRole('heading', { name: 'Computing seminar', exact: true })).toBeVisible();
    await page.getByLabel('Message', { exact: true }).fill(text);
    await page.getByRole('button', { name: 'Post to discussion' }).click();
    const parent = page.locator('li').filter({ has: page.getByText(text, { exact: true }) });
    await parent.getByRole('button', { name: /Reply to post/ }).click();
    await expect(page.getByLabel('Message', { exact: true })).toBeFocused();
    await page.keyboard.type(`${text} reply`);
    await page.getByRole('button', { name: 'Post to discussion' }).click();
    await expect(page.getByText(`${text} reply`, { exact: true })).toBeVisible();
    await page.reload();
    const response = page.locator('li').filter({ has: page.getByText(`${text} reply`, { exact: true }) });
    await expect(response.getByRole('link', { name: /Reply to post/ })).toHaveAttribute('href', /^#post-/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
