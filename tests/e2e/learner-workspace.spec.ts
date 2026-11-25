import { expect, test as base } from '@playwright/test';

const test = base.extend({
    timezoneId: async ({}, use, info) => {
        await use(info.project.name === 'phone' ? 'America/New_York' : 'Asia/Kolkata');
    },
});

test('a registered learner can find a course and submit a persisted revision', async ({ page }, info) => {
    const learner = info.project.name === 'desktop' ? 'ada' : 'tunde';
    const reflection = `${learner}: a timetable takes available hours as input and returns a study plan.`;

    await page.goto('/login');
    await page.locator('input[name="email"]').fill(`${learner}@demo.example.test`);
    const password = page.getByLabel('Password', { exact: true });
    await password.fill('incorrect-password');
    await password.press('Enter');
    const invalid = page.getByLabel('Email, matric number or staff ID');
    await expect(invalid).toBeFocused();
    await expect(invalid).toHaveAccessibleDescription(/credentials/i);
    await expect(password).toHaveValue('');
    await invalid.press('Tab');
    await expect(password).toBeFocused();
    await password.fill('password');
    await password.press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'My study desk' })).toBeVisible();
    const week = page.getByRole('list', { name: 'This week, Monday through Sunday' });
    await expect(week.getByRole('listitem')).toHaveCount(7);
    await expect(week.locator('[aria-current="date"]')).toContainText('Today');
    await expect(page.getByText('Computing reflection', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View assignment', exact: true })).toBeVisible();

    const due = await page.locator('li').filter({ has: page.getByRole('heading', { name: 'Computing reflection' }) })
        .locator('time').innerText();
    expect(due).toMatch(/GMT[+-]\d\d:\d\d/);
    if (info.project.name === 'phone') await page.getByRole('button', { name: 'Menu', exact: true }).press('Enter');
    await page.getByRole('link', { name: 'Search courses', exact: true }).press('Enter');
    await page.getByLabel('Course search', { exact: true }).fill('CSC101');
    await page.getByLabel('Course search', { exact: true }).press('Enter');
    await page.getByRole('link', { name: /introduction to computing/i }).press('Enter');
    await expect(page.getByRole('heading', { name: /introduction to computing/i }).first()).toBeVisible();
    await page.getByRole('link', { name: 'Open lesson' }).press('Enter');
    await expect(page.getByRole('heading', { name: 'First reading' })).toBeVisible();
    await page.getByRole('link', { name: 'Return to course activities' }).press('Enter');

    const activity = page.locator('.activity-sequence li').filter({ hasText: 'Computing reflection' });
    await expect(activity.locator('time')).toHaveText(due);
    await activity.getByRole('link', { name: 'Computing reflection' }).press('Enter');
    await expect(page.getByText('Due', { exact: true }).locator('..').locator('time')).toHaveText(due);
    await expect(page.getByText('Submissions close', { exact: true }).locator('..').locator('time')).toContainText('GMT');
    await expect(page.getByText(/Maximum 1 MiB \(1,048,576 bytes\)/)).toBeVisible();
    await page.getByLabel('Answer', { exact: true }).fill(reflection);
    await page.getByRole('button', { name: /submit revision/i }).press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'Revision received.' })).toBeVisible();
    await page.getByRole('link', { name: 'View submission history' }).press('Enter');
    await expect(page.getByText(/receipt:/i).first()).toBeVisible();

    await page.reload();
    await expect(page.getByText(reflection, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'My study desk' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View assignment', exact: true })).toHaveCount(0);
});
