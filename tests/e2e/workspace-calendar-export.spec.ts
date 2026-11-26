import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.use({ timezoneId: 'America/Los_Angeles' });

for (const role of ['admin', 'lecturer', 'student']) {
    test(`${role} calendar exports institutional event times independently of the device time zone`, async ({ page }) => {
        await page.goto(`/${role}/calendar`);
        await expect(page.getByText(/All times in West Africa Time/)).toBeVisible();
        await page.getByRole('button', { name: 'Add event' }).first().click();
        const dialog = page.getByRole('dialog');
        await dialog.getByLabel('Title').fill('Year boundary');
        await dialog.getByLabel('Date', { exact: true }).fill('2027-01-01');
        await dialog.getByLabel('Time (WAT, UTC+01:00)').fill('00:15');
        await dialog.getByRole('button', { name: 'Save event' }).click();
        const download = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Export calendar' }).click();
        const file = await download;
        const contents = await readFile((await file.path())!, 'utf8');
        expect(contents.match(/BEGIN:VEVENT/g)).toHaveLength(19);
        expect(contents).toContain('DTSTART:20261231T231500Z\r\nSUMMARY:Year boundary');
        expect(contents).toContain('DTSTART:20261103T080000Z\r\nSUMMARY:Course delivery opens');
    });
}
