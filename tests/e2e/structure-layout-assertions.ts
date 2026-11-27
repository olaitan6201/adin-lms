import { expect, type Page } from '@playwright/test';

export async function verifyNarrowHierarchy(page: Page) {
    const viewport = page.viewportSize()!;
    for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: viewport.height });
        const title = await page.getByRole('heading', { name: 'Institution hierarchy', exact: true }).boundingBox();
        const count = await page.getByText(/^\d+ faculties$/).boundingBox();
        expect(title).not.toBeNull();
        expect(count).not.toBeNull();
        expect(count!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.setViewportSize(viewport);
}

export async function verifyOversight(page: Page, title: string, suffix: string) {
    const viewport = page.viewportSize()!;
    if (suffix === 'phone') {
        await page.setViewportSize({ width: 320, height: viewport.height });
    }
    const oversight = page.getByRole('button', { name: `Oversight scope for ${title}` });
    await oversight.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Oversight scope' });
    await expect(dialog.getByText(title, { exact: true })).toBeVisible();
    await expect(dialog.getByText('No active dean assigned.')).toBeVisible();
    await expect(dialog.getByText(`Units ${suffix}`, { exact: true })).toBeVisible();
    const close = dialog.getByRole('button', { name: 'Close panel' });
    await expect(close).toBeFocused();
    const bounds = await close.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.keyboard.press('Escape');
    await expect(oversight).toBeFocused();
    await page.setViewportSize(viewport);
}
