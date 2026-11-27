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

test.describe('controlled outstanding work', () => {
    test.use({ serviceWorkers: 'block' });

    test('an open ENG210 assignment without a receipt opens its detail directly', async ({ page }) => {
        // Remove only the receipt lookup key from the test browser's copy of the public fixture module.
        await page.route(/\/assets\/studentAssignments-[\w-]+\.js$/, async (route) => {
            const response = await route.fetch();
            const original = await response.text();
            const body = original.replace('"as-4":', '"omitted-receipt":');
            expect(body).not.toBe(original);
            await route.fulfill({ response, body });
        });
        await page.goto('/student/overview');
        const row = page.getByRole('row').filter({ hasText: 'Group presentation: narrative voice' });
        const link = row.getByRole('link', { name: 'Open', exact: true });
        await expect(link).toHaveAttribute('href', '/student/assignments#assignment=as-4');
        await link.click();
        const drawer = page.getByRole('dialog');
        await expect(drawer.getByRole('heading', { name: 'Group presentation: narrative voice' })).toBeVisible();
        await expect(drawer).toContainText('ENG210');
        await expect(drawer).not.toContainText('Existing submission');
        await expect(drawer).not.toContainText('ACC302');
    });
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
