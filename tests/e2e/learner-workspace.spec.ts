import { expect, test } from '@playwright/test';

test('a registered learner can find a course and submit a persisted revision', async ({ page }, info) => {
    const learner = info.project.name === 'desktop' ? 'ada' : 'tunde';
    const reflection = `${learner}: a timetable takes available hours as input and returns a study plan.`;

    await page.goto('/login');
    await page.locator('input[name="email"]').fill(`${learner}@demo.example.test`);
    await page.locator('input[name="password"]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('/search?q=CSC101');
    await page.getByRole('link', { name: /introduction to computing/i }).click();
    await expect(page.getByRole('heading', { name: /introduction to computing/i }).first()).toBeVisible();

    await page.getByRole('link', { name: /^assessments$/i }).click();
    await page.getByRole('link', { name: /view assignment|computing reflection/i }).first().click();
    await page.getByLabel('Answer', { exact: true }).fill(reflection);
    await page.getByRole('button', { name: /submit revision/i }).click();
    await expect(page.getByText(/receipt:/i).first()).toBeVisible();

    await page.reload();
    await expect(page.getByText(reflection, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
