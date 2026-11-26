import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('the downloaded QA report records the run shown after checking again', async ({ page }, info) => {
    await page.goto('/admin/qa-review');
    const main = page.getByRole('main');
    const badge = main.getByText(/^Last run /);
    const initial = await badge.innerText();
    await main.getByRole('button', { name: 'Run checks again' }).click();
    await expect(badge).not.toHaveText(initial);
    await expect(badge).toBeVisible();
    const displayed = (await badge.innerText()).replace(/^Last run\s+/i, '');
    expect(displayed).toMatch(/\d/);

    const downloadEvent = page.waitForEvent('download');
    await main.getByRole('button', { name: 'Export report', exact: true }).first().click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe('compliance-report.json');
    const path = info.outputPath(download.suggestedFilename());
    await download.saveAs(path);
    const [summary] = JSON.parse(await readFile(path, 'utf8'));
    expect(summary.lastRun).toBe(displayed);
});
