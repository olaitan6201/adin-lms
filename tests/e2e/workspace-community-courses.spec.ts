import { expect, test } from '@playwright/test';

for (const kind of ['forum', 'group'] as const) {
    test(`${kind} rejects missing and unknown courses before accepting a non-first choice`, async ({ page }) => {
        await page.goto('/lecturer/communication');
        if (kind === 'group') await page.getByRole('tab', { name: 'Group discussions' }).click();
        await page.getByRole('button', { name: kind === 'group' ? 'Create group' : 'New forum' }).click();
        const dialog = page.getByRole('dialog');
        const name = `Seminar ${kind}`;
        await dialog.getByLabel(kind === 'group' ? 'Group name' : 'Forum title').fill(name);
        if (kind === 'group') await dialog.getByLabel('Group task').fill('Compare readings');
        const course = dialog.getByRole('combobox', { name: 'Course', exact: true });
        const submit = dialog.getByRole('button', { name: `Create ${kind}` });
        const second = kind === 'forum' ? 'ENG210' : 'BSC205';

        // A disabled field is absent from FormData. An extra option is present but outside the allowed list.
        await course.evaluate((el: HTMLSelectElement) => { el.disabled = true; });
        await submit.click();
        await expect(dialog.getByRole('alert')).toHaveText('Select an available course.');
        await course.evaluate((el: HTMLSelectElement) => {
            el.disabled = false;
            el.add(new Option('Unlisted course', 'unlisted'));
        });
        await course.selectOption('unlisted');
        await submit.click();
        await expect(dialog.getByRole('alert')).toHaveText('Select an available course.');
        await course.selectOption({ label: second });
        await submit.click();
        await expect(dialog).toHaveCount(0);
        const created = page.getByRole('row').filter({ hasText: name });
        await expect(created).toHaveCount(1);
        await expect(created).toContainText(second);
    });
}
