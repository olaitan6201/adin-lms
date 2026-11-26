import { expect, test } from '@playwright/test';

test('a student with no downloadable files sees an empty library', async ({ page }, info) => {
    await page.goto('/student/downloads');
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('[name=email]').fill(`workspace-learner-${info.project.name}@demo.example.test`);
    await page.locator('[name=password]').fill('password');
    await page.locator('[name=password]').press('Enter');

    await expect(page.getByRole('heading', { name: 'Course downloads', exact: true })).toBeVisible();
    const library = page.getByRole('region', { name: 'Available to download' });
    await expect(library.getByText('No course files are available to download right now.')).toBeVisible();
    await expect(library.getByRole('link')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'After downloading' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
