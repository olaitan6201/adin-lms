import { expect, test } from '@playwright/test';

for (const offline of [false, true]) {
    test(`marking row opens its own script ${offline ? 'offline' : 'online'}`, async ({ page, context }) => {
        await page.goto('/lecturer/overview');
        if (offline) {
            await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
            await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
            await context.setOffline(true);
        }
        for (const [id, name, matric] of [
            ['sub-1', 'Blessing Okonkwo', 'AOU/2023/0412'],
            ['sub-2', 'Chinedu Okafor', 'AOU/2024/1187'],
        ]) {
            const link = page.getByRole('row').filter({ hasText: matric }).getByRole('link', { name: 'Marking desk' });
            await expect(link).toHaveAttribute('href', `/lecturer/assignments#submission=${id}`);
            await link.click();
            const drawer = page.getByRole('dialog');
            await expect(drawer.getByRole('heading', { name, exact: true })).toBeVisible();
            await expect(drawer).toContainText(matric);
            await expect(drawer).not.toContainText(id === 'sub-1' ? 'AOU/2024/1187' : 'AOU/2023/0412');
            await page.goto('/lecturer/overview');
        }
        await page.getByRole('link', { name: 'Assignment desk', exact: true }).click();
        await expect(page).toHaveURL(/\/lecturer\/assignments$/);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Assignments and marking');
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });
}

test('each prototype assignment opens its own native record', async ({ page }) => {
    for (const [id, title, course, detail] of [
        ['as-1', 'Journal entry and trial balance problem set', 'ACC302', 'Existing submission'],
        ['as-2', 'Case analysis: IFRS 15 revenue recognition', 'ACC302', 'Not open yet'],
        ['as-4', 'Group presentation: narrative voice', 'ENG210', 'Existing submission'],
    ]) {
        await page.goto('/student/overview');
        const link = page.getByRole('row').filter({ hasText: title }).getByRole('link', { name: 'Open', exact: true });
        await expect(link).toHaveAttribute('href', `/student/assignments#assignment=${id}`);
        await link.click();
        const drawer = page.getByRole('dialog');
        await expect(drawer.getByRole('heading', { name: title })).toBeVisible();
        await expect(drawer).toContainText(course);
        await expect(drawer).toContainText(detail);
    }
});

test('unknown, ambiguous and wrong-role selections stay on the unselected desk', async ({ page }) => {
    for (const url of [
        '/lecturer/assignments#submission=unknown',
        '/lecturer/assignments#submission=sub-2&submission=sub-1',
        '/admin/assignments#submission=sub-1',
        '/student/assignments#submission=sub-2',
        '/student/assignments#assignment=unknown',
        '/student/assignments#assignment=as-3',
    ]) {
        await page.goto(url);
        await expect(page.locator('main tbody tr').first()).toBeVisible();
        await expect(page.getByRole('dialog')).toHaveCount(0);
    }
});
