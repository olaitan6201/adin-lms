import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('a reply reads only its conversation and a draft survives keyboard tab switches', async ({ page }) => {
    await page.goto('/student/communication');
    const messages = page.getByRole('tab', { name: /Messages/ });
    await expect(messages).toContainText('3');
    await messages.click();
    const input = page.getByLabel('Write a message');
    await input.fill('Thanks for extending the deadline');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(messages).toContainText('1');
    await page.getByRole('tabpanel').getByRole('button', { name: /Blessing Okonkwo/ }).click();
    await expect(messages).toContainText('0');
    await input.fill('My draft on the rubric');
    await messages.press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'My groups' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(input).toHaveValue('My draft on the rubric');
    await expect(page.getByRole('heading', { name: /Blessing Okonkwo/ })).toBeVisible();
});

test('moving a topic and then replying updates only the affected forum totals', async ({ page }) => {
    await page.goto('/lecturer/communication');
    const topic = page.getByRole('row', { name: /Group 4 presentation/ });
    const source = page.getByRole('row', { name: /Mid-term revision clinic/ });
    const target = page.getByRole('row', { name: /Laboratory safety and conduct/ });
    await topic.getByRole('button', { name: 'Open' }).click();
    await page.getByLabel('Move thread').selectOption({ label: 'Laboratory safety and conduct' });
    await page.getByRole('button', { name: 'Post reply' }).click();
    await expect(source.getByRole('cell').nth(1)).toHaveText('10');
    await expect(target.getByRole('cell').nth(1)).toHaveText('7');
    await expect(target.getByRole('cell').nth(2)).toHaveText('44');
    await topic.getByRole('button', { name: 'Open' }).click();
    await page.getByLabel('Reply', { exact: true }).fill('Your new case study is approved.');
    await page.getByRole('button', { name: 'Post reply' }).click();
    await expect(target.getByRole('cell').nth(1)).toHaveText('7');
    await expect(target.getByRole('cell').nth(2)).toHaveText('45');
    await expect(topic.getByRole('cell').nth(2)).toHaveText('4');
});

test('faculty scope exports its visible measures and denied audit storage blocks both formats', async ({ page }, info) => {
    await page.goto('/admin/reports');
    await page.getByRole('tab', { name: 'Faculty and department' }).click();
    const title = 'Engagement heatmap by department';
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Excel' }).click();
    const workbook = await downloaded;
    const file = info.outputPath(workbook.suggestedFilename());
    await workbook.saveAs(file);
    const xml = await readFile(file, 'utf8');
    expect(xml).toContain(`ss:Name="${title.slice(0, 31)}"`);
    expect(xml).toContain('Biological Sciences');
    expect(xml).not.toContain('Students needing attention');

    await page.evaluate(() => {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
            if (key === 'adin:sample-report-audit') throw new Error('Storage denied');
            original.call(this, key, value);
        };
        window.print = () => { document.body.dataset.printed = 'yes'; };
        HTMLAnchorElement.prototype.click = () => { document.body.dataset.downloaded = 'yes'; };
    });
    for (const format of ['Excel', 'PDF']) {
        await page.getByRole('button', { name: format, exact: true }).click();
        await expect(page.getByRole('alert')).toContainText('The export could not be recorded');
    }
    expect(await page.evaluate(() => [document.body.dataset.printed, document.body.dataset.downloaded])).toEqual([undefined, undefined]);
});

test('lecturer course opens the keyed panel and unmounts its inactive content', async ({ page }) => {
    await page.goto('/lecturer/course');
    await page.getByRole('tab', { name: 'Attendance' }).click();
    const attendance = page.getByText('Attendance for this course', { exact: true });
    await expect(attendance).toBeVisible();
    await page.getByRole('tab', { name: 'Attendance' }).press('ArrowRight');
    await expect(page.getByRole('tabpanel').getByRole('link', { name: 'Open communication' })).toBeVisible();
    await expect(attendance).toHaveCount(0);
});
