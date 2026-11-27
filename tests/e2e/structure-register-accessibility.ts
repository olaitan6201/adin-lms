import { expect, type Locator, type Page } from '@playwright/test';

export async function verifyEmptyAcademicRegister(page: Page) {
    const register = page.locator('.structure-register');
    await expect(register.getByText('No matching records.', { exact: true })).toHaveCount(4);
    await expect(register.getByRole('button', { name: 'Add programme level' })).toBeDisabled();
    await expect(register.getByRole('button', { name: 'Add pathway' })).toBeDisabled();
    await expect(register.getByText('Add a shared programme before configuring its levels.')).toBeVisible();
}

export async function verifyRegisterDrawerContrast(dialog: Locator, field = dialog.getByLabel('Code', { exact: true })) {
    await field.focus();
    const colors = await field.evaluate(input => {
        const submit = input.closest('form')!.querySelector('button[type="submit"]')!;
        const inputStyle = getComputedStyle(input);
        const submitStyle = getComputedStyle(submit);
        const surface = getComputedStyle(input.closest('dialog')!).backgroundColor;
        const context = document.createElement('canvas').getContext('2d')!;

        function luminance(color: string) {
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const [red, green, blue] = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map(value => {
                const channel = value / 255;
                return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            });

            return red * 0.2126 + green * 0.7152 + blue * 0.0722;
        }

        function contrast(foreground: string, background: string) {
            const light = luminance(foreground);
            const dark = luminance(background);

            return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
        }

        return {
            submit: contrast(submitStyle.color, submitStyle.backgroundColor),
            border: contrast(inputStyle.borderTopColor, surface),
            ring: contrast(inputStyle.outlineColor, surface),
            outline: parseFloat(inputStyle.outlineWidth),
        };
    });

    expect(colors.submit).toBeGreaterThanOrEqual(4.5);
    expect(colors.border).toBeGreaterThanOrEqual(3);
    expect(colors.ring).toBeGreaterThanOrEqual(3);
    expect(colors.outline).toBeGreaterThanOrEqual(2);
}

export async function verifyRegisterDrawerFocus(page: Page, dialog: Locator) {
    const close = dialog.getByRole('button', { name: 'Close panel' });
    const submit = dialog.getByRole('button', { name: 'Add shared programme' });
    await close.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(submit).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
}

export async function verifyRegisterHeaderContrast(page: Page) {
    const ratios = await page.locator('.structure-register-table thead th').evaluateAll(headers => {
        const context = document.createElement('canvas').getContext('2d')!;

        function luminance(color: string) {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const [red, green, blue] = Array.from(context.getImageData(0, 0, 1, 1).data).map(value => {
                const channel = value / 255;
                return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            });

            return red * 0.2126 + green * 0.7152 + blue * 0.0722;
        }

        return headers.map(header => {
            const foreground = luminance(getComputedStyle(header).color);
            const background = luminance(getComputedStyle(header.closest('.card')!).backgroundColor);

            return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
        });
    });

    expect(ratios).toHaveLength(15);
    expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
}

export async function verifyRegisterKeyboardScroll(page: Page) {
    const scroll = page.getByRole('region', { name: 'Programme levels', exact: true });
    const manage = scroll.getByRole('button', { name: /Manage First year phone/ });
    const dialog = page.getByRole('dialog');
    const scrollable = await scroll.evaluate(element => element.scrollWidth > element.clientWidth);
    expect(scrollable).toBe(true);
    await page.getByRole('button', { name: 'Add programme level', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(scroll).toBeFocused();
    const clipped = await manage.evaluate(button => {
        const region = button.closest('[data-scroll]')!;
        return button.getBoundingClientRect().right > region.getBoundingClientRect().right;
    });
    expect(clipped).toBe(true);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => scroll.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    await page.keyboard.press('Tab');
    await expect(manage).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog.getByLabel('Level label')).toHaveValue('First year phone');
    await page.keyboard.press('Escape');
    await expect(manage).toBeFocused();
}

export async function verifyPendingRegisterSave(page: Page, dialog: Locator) {
    const routePattern = '**/admin/structure/register/programme-levels/*';
    let release: () => void = () => {};
    const delayed = new Promise<void>(resolve => {
        release = resolve;
    });

    await page.route(routePattern, async route => {
        await delayed;
        await route.continue();
    }, { times: 1 });

    try {
        await dialog.getByLabel('Display order').fill('3');
        await dialog.getByRole('button', { name: 'Save changes' }).click();
        await expect(dialog.getByRole('status')).toContainText(/saving/i);
        await expect(dialog.getByRole('button', { name: 'Close panel' })).toBeDisabled();
        await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        await expect(dialog.getByLabel('Display order')).toBeDisabled();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeVisible();
    } finally {
        release();
    }

    await expect(dialog).toHaveCount(0);
}
