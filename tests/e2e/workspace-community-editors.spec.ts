import { expect, test } from '@playwright/test';

test('an absent recipient cannot submit, then a non-first recipient gets the message', async ({ page }) => {
    await page.goto('/student/communication');
    await page.getByRole('button', { name: 'New message' }).click();
    const dialog = page.getByRole('dialog');
    const recipient = dialog.getByLabel('Recipient');
    await expect(dialog).toContainText('The recipient will not receive it.');
    await dialog.getByLabel('Subject').fill('New timetable');
    await dialog.getByLabel('Message', { exact: true }).fill('Could you confirm the new time?');
    // Disabled controls are omitted from FormData; simulate a recipient disappearing during composition.
    await recipient.evaluate((select: HTMLSelectElement) => { select.disabled = true; });
    await dialog.getByRole('button', { name: 'Send sample message' }).click();
    await expect(dialog).toBeVisible();
    await recipient.evaluate((select: HTMLSelectElement) => { select.disabled = false; });
    await recipient.selectOption({ label: 'Examinations Office' });
    await dialog.getByRole('button', { name: 'Send sample message' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('tabpanel')).toContainText('not delivered');
    await expect(page.getByRole('heading', { name: 'Examinations Office New timetable' })).toBeVisible();
    await expect(page.getByRole('tabpanel').getByText(/^Today, \d\d:\d\d$/)).toBeVisible();
    await expect(page.getByRole('tabpanel').getByRole('listitem')).toHaveCount(4);
});

test('an empty forum opens its own drawer, then accepts a moved topic and reply', async ({ page }) => {
    await page.goto('/lecturer/communication');
    const dialog = page.getByRole('dialog');
    await page.getByRole('button', { name: 'New forum' }).click();
    await dialog.getByLabel('Forum title').fill('Study clinic');
    await dialog.getByRole('button', { name: 'Create forum' }).click();
    const target = page.getByRole('row', { name: /Study clinic/ });
    await target.getByRole('button', { name: 'Moderate' }).click();
    await expect(dialog).toContainText('No threads yet.');
    await page.keyboard.press('Escape');
    const unrelated = page.getByRole('row', { name: /Journal entries:/ });
    const unchanged = await unrelated.innerText();
    await page.getByRole('row', { name: /Group 4 presentation/ }).getByRole('button', { name: 'Open' }).click();
    await dialog.getByLabel('Move thread').selectOption({ label: 'Study clinic' });
    await dialog.getByLabel('Reply', { exact: true }).fill('Take this to the clinic.');
    await dialog.getByRole('button', { name: 'Post reply' }).click();
    await expect(target.getByRole('cell').nth(1)).toHaveText('1');
    await expect(target.getByRole('cell').nth(2)).toHaveText('1');
    expect(await unrelated.innerText()).toBe(unchanged);
    await target.getByRole('button', { name: 'Moderate' }).click();
    await expect(dialog).toContainText('Take this to the clinic.');
});

test('a duplicate group name can be corrected and a post affects only the new group', async ({ page }) => {
    await page.goto('/lecturer/communication');
    await page.getByRole('tab', { name: 'Group discussions' }).click();
    const existing = page.getByRole('row', { name: /Group 4: consolidation case/ });
    const originalCount = await existing.getByRole('cell').nth(2).innerText();
    await page.getByRole('button', { name: 'Create group' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Group name').fill('Group 4: consolidation case');
    await dialog.getByLabel('Group task').fill('Compare notes');
    await dialog.getByRole('button', { name: 'Create group' }).click();
    expect(await dialog.getByLabel('Group name').evaluate((el: HTMLInputElement) => el.validationMessage)).toContain('different group name');
    await dialog.getByLabel('Group name').fill('New seminar');
    await dialog.getByRole('button', { name: 'Create group' }).click();
    await page.getByLabel('Write to your group').fill('Notes are ready');
    await page.getByRole('button', { name: 'Post', exact: true }).click();
    await expect(page.getByRole('row', { name: /New seminar/ }).getByRole('cell').nth(2)).toHaveText('1');
    await expect(existing.getByRole('cell').nth(2)).toHaveText(originalCount);
    await existing.getByRole('button', { name: 'Open' }).click();
    await expect(page.getByText('Notes are ready')).toHaveCount(0);
});

test('cancel preserves draft channels and publishing uses the edited selection', async ({ page }) => {
    await page.goto('/lecturer/communication');
    await page.getByRole('button', { name: 'New announcement' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('No email, SMS or push notification is sent.');
    await dialog.getByLabel('Title').fill('Seminar moved');
    await dialog.getByLabel('Message', { exact: true }).fill('Meet in room 2.');
    await dialog.getByLabel('Email').uncheck();
    await dialog.getByLabel('SMS').check();
    await dialog.getByRole('button', { name: 'Save draft' }).click();
    const row = page.getByRole('row', { name: /Seminar moved/ });
    await expect(row).toContainText('Draft');
    await row.getByRole('button', { name: 'Edit' }).click();
    await dialog.getByLabel('SMS').uncheck();
    await page.keyboard.press('Escape');
    await expect(row).toContainText('In-platform and SMS');
    await row.getByRole('button', { name: 'Edit' }).click();
    await expect(dialog.getByLabel('SMS')).toBeChecked();
    await dialog.getByLabel('SMS').uncheck();
    await dialog.getByLabel('Push notification').check();
    await dialog.getByRole('button', { name: 'Publish locally' }).click();
    await expect(row.getByRole('cell', { name: 'Published locally' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Sent', exact: true })).toHaveCount(2);
    await expect(row).toContainText('In-platform and Push notification');
    await expect(row).not.toContainText('SMS');
});
