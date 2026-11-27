import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

for (const role of ['student', 'lecturer']) {
    test(`${role} opens the selected course from either listing and rejects an unknown code`, async ({ page }) => {
        for (const list of ['courses', 'overview']) {
            await page.goto(`/${role}/${list}`);
            const container = list === 'courses' && role === 'student' ? 'article' : 'tbody tr';
            const course = page.locator(container).filter({ hasText: 'BSC205' }).filter({ hasText: 'Cell and Molecular Biology' }).first();
            await course.getByRole('link').click();
            await expect(page).toHaveURL(new RegExp(`/${role}/course\\?course=BSC205$`));
            await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cell and Molecular Biology');
            await expect(page.locator('main')).not.toContainText('Journals and ledgers');
            if (role === 'lecturer') {
                await expect(page.getByRole('row').filter({ hasText: 'mitosis observation' })).toHaveCount(1);
            }
        }
        await page.goto(`/${role}/course?course=UNKNOWN`);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Course unavailable');
        await expect(page.locator('main table')).toHaveCount(0);
    });
}

test('reader switches content, respects the locked boundary and downloads selected lesson bytes', async ({ page }) => {
    await page.goto('/student/course');
    await expect(page.getByRole('button', { name: /Recognition and measurement of assets/ })).toBeDisabled();
    await page.getByRole('button', { name: 'Mark complete for this visit' }).click();
    await expect(page.getByRole('button', { name: 'Complete', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Next lesson · Week 4', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Practice set with worked solutions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next lesson locked' })).toBeDisabled();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Save offline' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('acc302-practice-set.docx');
    expect(execFileSync('unzip', ['-Z1', (await file.path())!], { encoding: 'utf8' })).toContain('word/document.xml');
    await page.getByRole('button', { name: 'Previous lesson' }).click();
    await expect(page.getByRole('button', { name: 'Complete', exact: true })).toBeDisabled();
    await expect(page.getByRole('link', { name: /Open the live text/ })).toHaveAttribute('target', '_blank');
});

test('device copies persist, remove individually, and the ZIP still contains all four originals', async ({ page, context }) => {
    await page.goto('/student/offline-downloads');
    const row = page.getByRole('row').filter({ hasText: 'Trial balance template' });
    await expect(row).toContainText('09 Nov 2026');
    await row.getByRole('button', { name: 'Remove' }).click();
    await expect(row).toContainText('Available to save');
    const individual = page.waitForEvent('download');
    await row.getByRole('button', { name: 'Download XLSX' }).click();
    const workbook = await individual;
    const bytes = await readFile((await workbook.path())!);
    expect(execFileSync('unzip', ['-Z1', (await workbook.path())!], { encoding: 'utf8' })).toContain('xl/workbook.xml');
    await page.reload();
    await expect(row).toContainText('Available offline');
    await context.setOffline(true);
    const offline = page.waitForEvent('download');
    await row.getByRole('button', { name: 'Download XLSX' }).click();
    expect(await readFile((await (await offline).path())!)).toEqual(bytes);
    await context.setOffline(false);
    await row.getByRole('button', { name: 'Remove' }).click();
    await page.reload();
    await expect(row).toContainText('Available to save');
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download all available' }).click();
    const zip = (await (await download).path())!;
    const names = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).trim().split('\n');
    expect(names.sort()).toEqual(['acc302-lecture-slides.pptx', 'acc302-practice-set.docx', 'acc302-trial-balance.xlsx', 'acc302-week3-v1.pdf']);
    expect(execFileSync('unzip', ['-p', zip, workbook.suggestedFilename()])).toEqual(bytes);
});

test('the public student dashboard shows the prototype scores and admin opens the selected approval', async ({ page }) => {
    await page.goto('/student/overview');
    const results = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Released results' }) });
    await expect(results.locator('tbody tr')).toHaveCount(4);
    const sample = results.getByRole('row').filter({ hasText: 'ACC302' });
    await expect(sample).toContainText('Pending');
    await expect(sample.getByRole('cell', { name: '43', exact: true })).toBeVisible();
    await page.goto('/admin/overview');
    const row = page.getByRole('row').filter({ hasText: 'Assessment weight change: CHM401' });
    await row.getByRole('button', { name: 'Review' }).click();
    await expect(page.getByRole('dialog')).toContainText('Dr. Grace Mbeki');
    await expect(page.getByRole('dialog')).not.toContainText('ECN221');
});

test('course drafts validate, survive tab switches and stay outside student preview', async ({ page }) => {
    await page.goto('/lecturer/course');
    const dialog = page.getByRole('dialog');
    await page.getByRole('button', { name: 'Open full roster' }).click();
    await expect(dialog.getByRole('heading', { name: 'Class roster' })).toBeVisible();
    await expect(dialog).toContainText('Showing 5 sample records');
    await page.keyboard.press('Escape');
    await page.getByRole('tab', { name: /Content/ }).click();
    const secondModule = page.getByRole('row').filter({ hasText: 'Accounting equation and double-entry bookkeeping' });
    await secondModule.getByRole('button', { name: 'Edit' }).click();
    await dialog.getByLabel('Title').fill('Revised equation');
    await dialog.getByRole('button', { name: 'Save local draft' }).click();
    await secondModule.getByRole('button', { name: 'Edit' }).click();
    await expect(dialog.getByLabel('Title')).toHaveValue('Revised equation');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Write chapter' }).click();
    await dialog.getByRole('button', { name: 'Save local draft' }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Title').fill('Local inventory chapter');
    await dialog.getByLabel('Chapter text').fill('Unpublished accounting example.');
    await dialog.getByRole('button', { name: 'Save local draft' }).click();
    await page.getByRole('tab', { name: /Resources/ }).click();
    await page.getByText('Chapter: Local inventory chapter').click();
    await expect(page.getByText('Unpublished accounting example.')).toBeVisible();
    await page.getByRole('link', { name: 'Preview as student' }).click();
    await expect(page.getByRole('heading', { name: 'Intermediate Financial Accounting' })).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Local inventory chapter');
});

test.describe('sample file network failures', () => {
    test.use({ serviceWorkers: 'block' });

    test('a failed individual file never becomes available offline', async ({ page }) => {
        await page.goto('/student/offline-downloads');
        const row = page.getByRole('row').filter({ hasText: 'Practice set (DOCX)' });
        await row.getByRole('button', { name: 'Remove' }).click();
        await expect(row).toContainText('Available to save');
        await page.route('**/assets/acc302-practice-set-*.docx', (route) => route.abort());
        await row.getByRole('button', { name: 'Download DOCX' }).click();
        await expect(row.getByRole('alert')).toContainText('Could not save');
        await expect(row).toContainText('Available to save');
        await expect(row.getByRole('button', { name: 'Remove' })).toHaveCount(0);
    });
});

test('allocation request and uploaded file remain identifiable local drafts', async ({ page }) => {
    await page.goto('/lecturer/courses');
    await page.getByRole('button', { name: 'Request allocation' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Requested course').fill('MTH112');
    await dialog.getByLabel('Details').fill('Tutorial support');
    await dialog.getByRole('button', { name: 'Save local draft' }).click();
    await expect(page.getByText(/Allocation request draft: MTH112/)).toContainText('not sent');
    await expect(page.locator('main tbody tr')).toHaveCount(4);
    await page.goto('/lecturer/course');
    await page.getByRole('tab', { name: /Resources/ }).click();
    await page.getByRole('button', { name: 'Upload resource' }).click();
    await dialog.getByLabel('Title').fill('Sample notes');
    await dialog.getByLabel('Sample file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('demo') });
    await dialog.getByRole('button', { name: 'Save local draft' }).click();
    await page.getByText('Resource: Sample notes').click();
    await expect(page.getByText('notes.txt · 4 bytes')).toBeVisible();
    await expect(page.getByRole('tabpanel').locator('tbody tr')).toHaveCount(9);
});
