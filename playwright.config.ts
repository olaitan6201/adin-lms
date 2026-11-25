import { defineConfig } from '@playwright/test';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { resolve } from 'node:path';

const baseURL = `http://127.0.0.1:${process.env.PORTAL_TEST_PORT ?? '19173'}`;
const runRoot = resolve('.agent-work/browser-tests');
mkdirSync(runRoot, { recursive: true });
process.env.PORTAL_E2E_RUN ??= mkdtempSync(`${runRoot}/run-`);

export default defineConfig({
    testDir: 'tests/e2e',
    workers: 1,
    forbidOnly: true,
    outputDir: '.agent-work/browser-tests/results',
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
    },
    webServer: {
        command: 'bash tests/e2e/serve.sh',
        url: `${baseURL}/up`,
        reuseExistingServer: false,
    },
    projects: [
        { name: 'desktop', use: { viewport: { width: 1366, height: 850 } } },
        { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    ],
});
