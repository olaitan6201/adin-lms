import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

for (const resume of [false, true]) {
    test(`warns once within five minutes (${resume ? 'resumed' : 'active'} exam)`, async ({ page }) => {
        await page.clock.install({ time: new Date('2026-11-18T09:00:00Z') });
        await page.goto('/student/exam');
        await expect(page.getByRole('status').filter({ hasText: 'All responses saved' })).toBeVisible();
        const warning = page.getByRole('alert').filter({ hasText: 'Five minutes or less remain' });
        await expect(warning).toHaveCount(0);
        if (resume) {
            await page.goto('/student/results');
            await expect(page.getByRole('heading', { name: 'Released scores' })).toBeVisible();
        }

        await page.clock.fastForward(resume ? '01:27:00' : '01:25:01');
        if (resume) {
            await page.goto('/student/exam');
            await expect(page.getByRole('timer')).toBeVisible();
            await page.clock.runFor(1000);
        }

        await expect(warning).toBeVisible();
        await page.reload();
        await page.clock.fastForward(1500);
        await expect(warning).toHaveCount(0);
    });
}

test('Results retrieves the submitted receipt and exports only released rows', async ({ page }) => {
    await page.goto('/student/results');
    await expect(page.getByText('Local attempt receipt')).toHaveCount(0);
    await page.goto('/student/exam');
    await page.getByRole('button', { name: 'Question 6, Not answered' }).click();
    const written = page.getByRole('textbox');
    await expect(written).toHaveAccessibleDescription(/Plain text only.*saved in this browser session/);
    await written.fill('Example response');
    await page.getByRole('button', { name: 'Submit examination' }).click();
    await page.getByRole('button', { name: 'Confirm submission' }).click();
    await page.getByRole('link', { name: 'View receipt in Results' }).click();
    await expect(page.getByRole('heading', { name: 'Released scores' })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Submitted by candidate')).toBeVisible();
    await expect(page.getByText('1 of 7', { exact: true })).toBeVisible();
    await expect(page.getByRole('table')).not.toContainText('ACC302');
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download result sheet' }).click();
    const file = await pending;
    expect(file.suggestedFilename()).toBe('sample-released-results.csv');
    const sheet = await readFile((await file.path())!, 'utf8');
    expect(sheet.split('\r\n')).toHaveLength(4);
    expect(sheet).toContain('"ENG210","Literary Devices and Criticism","24","16","0","40","C"');
    expect(sheet).not.toContain('ACC302');
});
