import { join } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
    activate, expectEncryptedHistory, primary, signIn, tabTo, verifyGuestExpiry, verifyLogoutAndSwitch, verifySecondPageReturn,
} from './placement-browser';

async function current(page: Page, destination: string, value: 'page' | 'location') {
    const navigation = await primary(page);
    const selected = navigation.locator('[aria-current]:not([aria-current="false"])');
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAccessibleName(destination);
    await expect(selected).toHaveAttribute('aria-current', value);
    if (await page.getByRole('dialog', { name: 'Portal menu' }).isVisible()) {
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
    }
}

async function focusAndFit(heading: Locator) {
    await expect(heading).toBeVisible();
    expect(await heading.evaluate(node => {
        const root = document.documentElement;
        const fits = () => root.scrollWidth <= root.clientWidth && node.scrollWidth <= node.clientWidth;
        const normal = fits();
        root.style.fontSize = innerWidth >= 1280 ? '200%' : '';
        const scaled = fits();
        root.style.fontSize = '';
        return { normal, scaled };
    })).toEqual({ normal: true, scaled: true });
}

function row(page: Page, registration: string, update: number) {
    return page.getByRole('link', { name: new RegExp(`^${registration} · Update ${update}\\b`) });
}

async function upload(page: Page, project: string, registration: string, update: number) {
    await page.getByLabel('Placement CSV').setInputFiles(join(process.env.PORTAL_E2E_RUN!, `placement-${project}-${update}.csv`));
    await activate(page, page.getByRole('button', { name: 'Send for review' }));
    await expect(row(page, registration, update)).toBeVisible();
}

async function checkedError(page: Page, field: Locator, message: RegExp) {
    const summary = page.getByRole('group', { name: 'Check your entries' });
    await expect(summary).toBeFocused();
    await expect(summary).toContainText(message);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription(message);
    await page.keyboard.press('Tab');
    await expect(field).toBeFocused();
}

async function completed(page: Page, action: string, heading: Locator, status: RegExp) {
    await expect(page.getByRole('button', { name: action })).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: status })).toBeVisible();
    await expect(heading).toBeFocused();
}

test('reviews numbered placements and confirms delivery by keyboard without exposing old sessions', async ({ page, browser }, info) => {
    const project = info.project.name;
    const registration = `REG-${project}-`.padEnd(128, 'X');
    const offering = `PLACEMENT-${project}-`.padEnd(128, 'X');
    const privateStudent = `PRIVATE-STUDENT-${project}-`.padEnd(128, 'X');
    const privateReason = `Confidential synthetic transfer reason ${project}`;
    const deliveryNote = `Confidential synthetic teaching reference ${project}`;
    const delivery = await browser.newPage({ viewport: page.viewportSize()!, hasTouch: project === 'phone' });
    await signIn(page, `registrar-${project}`, /\/admin\/placements$/);
    await current(page, 'Student placements', 'page');
    if (project === 'desktop') {
        await expect(page.getByText('No placement updates yet.', { exact: false })).toBeVisible();
    }
    const file = page.getByLabel('Placement CSV');
    await file.setInputFiles({ name: 'wrong.csv', mimeType: 'text/csv', buffer: Buffer.from('wrong,headers\n') });
    await activate(page, page.getByRole('button', { name: 'Send for review' }));
    await checkedError(page, file, /use the placement CSV template/i);
    await upload(page, project, registration, 2);
    await activate(page, row(page, registration, 2));
    await expect(page.getByText('On hold. Review update 1 first.')).toBeVisible();
    const approve = page.getByRole('button', { name: 'Approve placement' });
    await expect(approve).toHaveCount(0);
    await upload(page, project, registration, 1);
    await activate(page, row(page, registration, 1));
    await current(page, 'Student placements', 'location');
    const admission = page.getByRole('heading', { name: `${registration} · Update 1`, exact: true });
    await focusAndFit(admission);
    const reason = page.getByLabel(/Reason for change/);
    await expect(reason).toHaveAccessibleDescription(/optional/i);
    await activate(page, approve);
    await completed(page, 'Approve placement', admission, /approv/i);

    const enrolment = page.getByLabel('Enrolment', { exact: true });
    await tabTo(page, enrolment);
    await page.keyboard.press('ArrowDown');
    await expect(enrolment.locator('option:checked')).toHaveText(`${offering} · A`);
    const link = page.getByRole('button', { name: 'Link enrolment' });
    await activate(page, link);
    await checkedError(page, enrolment, /offering needs an exact course link/i);

    await signIn(delivery, `structure-${project}`, /\/admin\/overview$/);
    await activate(delivery, (await primary(delivery)).getByRole('link', { name: 'Delivery links', exact: true }));
    await expect(delivery).toHaveURL('/admin/delivery-links');
    await current(delivery, 'Delivery links', 'page');
    await activate(delivery, delivery.getByRole('link', { name: `NO-MATCH-${project}`, exact: true }));
    await expect(delivery.getByText(/no approved requirements/i)).toBeVisible();
    await activate(delivery, delivery.getByRole('link', { name: `BLOCKED-${project}`, exact: true }));
    await expect(delivery.getByRole('heading', { name: 'Blocked: reconciliation required' })).toBeVisible();
    await expect(delivery.getByRole('button', { name: 'Confirm delivery link' })).toHaveCount(0);
    await expect(delivery.getByText('All matching approved requirements are linked.')).toHaveCount(0);
    await activate(delivery, delivery.getByRole('link', { name: offering, exact: true }));
    const taught = delivery.getByRole('heading', { name: offering, exact: true });
    await expect(taught).toBeFocused();
    await current(delivery, 'Delivery links', 'location');
    await focusAndFit(taught);
    const requirement = delivery.getByLabel('Approved curriculum requirement');
    await tabTo(delivery, requirement);
    await delivery.keyboard.press('ArrowDown');
    await expect(requirement.locator('option:checked')).toContainText(`APPROVED-COURSE-${project}-`.padEnd(180, 'X'));
    const confirm = delivery.getByRole('button', { name: 'Confirm delivery link' });
    const reference = delivery.getByLabel('Teaching record reference');
    await activate(delivery, confirm);
    await expect(reference).toBeFocused();
    await delivery.keyboard.insertText(deliveryNote);
    await activate(delivery, confirm);
    await completed(delivery, 'Confirm delivery link', taught, /link|confirm/i);
    await expectEncryptedHistory(delivery);
    const deliveryUrl = delivery.url();
    await delivery.reload();
    await expect(delivery.getByText(deliveryNote, { exact: false })).toBeVisible();
    await delivery.screenshot({ path: info.outputPath('delivery.png'), animations: 'disabled', fullPage: true });

    await activate(page, link);
    await completed(page, 'Link enrolment', admission, /link/i);
    await page.reload();
    await expect(page.getByText(`${offering} · Linked`, { exact: true })).toBeVisible();
    await activate(page, row(page, registration, 2));
    const transfer = page.getByRole('heading', { name: `${registration} · Update 2`, exact: true });
    await focusAndFit(transfer);
    await expect(reason).toHaveAccessibleDescription(/required when the pathway or cohort changes/i);
    await expect(reason).toHaveJSProperty('required', true);
    await tabTo(page, reason);
    await page.keyboard.insertText('   ');
    await activate(page, approve);
    await checkedError(page, reason, /give a reason.*pathway or cohort change/i);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(reason).toBeFocused();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.insertText(privateReason);
    await activate(page, approve);
    await completed(page, 'Approve placement', transfer, /approv/i);
    await expect(page.getByText(privateReason, { exact: true })).toBeVisible();
    await expect(page.getByText(privateStudent, { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath('placement.png'), animations: 'disabled', fullPage: true });

    const protectedUrl = page.url();
    await verifyLogoutAndSwitch(page, `structure-switch-${project}`, /\/admin\/overview$/, protectedUrl, [privateReason, privateStudent]);
    await verifyGuestExpiry(browser, page, project, protectedUrl, privateStudent);
    await verifySecondPageReturn(delivery, 'delivery-links', /^ZZZ-PUBLISHED-/);
    await delivery.goto(deliveryUrl);
    await verifyLogoutAndSwitch(delivery, `registrar-delivery-switch-${project}`, /\/admin\/placements$/, deliveryUrl, [deliveryNote]);
    const queueFile = delivery.getByLabel('Placement CSV');
    await delivery.goto('/admin/placements');
    await queueFile.setInputFiles(join(process.env.PORTAL_E2E_RUN!, `placement-page-two-${project}.csv`));
    await activate(delivery, delivery.getByRole('button', { name: 'Send for review' }));
    await expect(delivery.getByRole('link', { name: 'Next updates', exact: true })).toBeVisible();
    await verifySecondPageReturn(delivery, 'placements', /^ZZZ-PLACEMENT-/);
});
