import { expect, test } from '@playwright/test';

test('course summary links to the same five initial results in the full gradebook', async ({ page }) => {
    await page.goto('/lecturer/course');
    await page.getByRole('tab', { name: 'Gradebook' }).click();
    const summary = await page.getByRole('tabpanel').locator('tbody tr').evaluateAll(rows =>
        rows.map(row => Array.from(row.querySelectorAll('td'), cell => cell.textContent ?? '')),
    );
    expect(summary).toHaveLength(5);
    await page.getByRole('link', { name: 'Open gradebook' }).click();
    for (const [name, ca, mid, total, grade] of summary) {
        const row = page.getByRole('row').filter({ hasText: name });
        await expect(row.getByRole('spinbutton').nth(0)).toHaveValue(ca);
        await expect(row.getByRole('spinbutton').nth(2)).toHaveValue(mid);
        await expect(row.getByRole('cell').nth(6)).toHaveText(total);
        await expect(row.getByRole('cell').nth(7)).toHaveText(grade);
    }
});
