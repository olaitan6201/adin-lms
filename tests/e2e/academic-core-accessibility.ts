import { expect, type Locator, type Page } from '@playwright/test';

export async function verifyCourseEditorKeyboard(page: Page, editor: Locator) {
    const summary = editor.locator('summary');
    await expect(summary).toBeFocused();
    const department = editor.getByLabel('Department', { exact: true });
    await page.keyboard.press('Tab');
    await expect(department).toBeFocused();
    const colours = await department.evaluate(element => {
        const canvas = document.createElement('canvas').getContext('2d')!;
        const styles = getComputedStyle(element);
        const surface = getComputedStyle(element.closest('section')!).backgroundColor;
        const submit = getComputedStyle(element.closest('form')!.querySelector('button')!);

        function luminance(color: string) {
            canvas.fillStyle = color;
            canvas.fillRect(0, 0, 1, 1);
            const [red, green, blue] = [...canvas.getImageData(0, 0, 1, 1).data].map(value => {
                const unit = value / 255;
                return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
            });

            return red * 0.2126 + green * 0.7152 + blue * 0.0722;
        }

        function contrast(first: string, second: string) {
            const a = luminance(first);
            const b = luminance(second);

            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        }

        return {
            outline: styles.outlineStyle,
            width: parseFloat(styles.outlineWidth),
            focus: contrast(styles.outlineColor, surface),
            boundary: contrast(styles.borderTopColor, surface),
            submit: contrast(submit.color, submit.backgroundColor),
        };
    });
    expect(colours.outline).toBe('solid');
    expect(colours.width).toBeGreaterThanOrEqual(2);
    expect(colours.focus).toBeGreaterThanOrEqual(3);
    expect(colours.boundary).toBeGreaterThanOrEqual(3);
    expect(colours.submit).toBeGreaterThanOrEqual(4.5);
    await page.keyboard.press('Shift+Tab');
    await expect(summary).toBeFocused();
}
