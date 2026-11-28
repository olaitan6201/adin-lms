import { defineConfig } from '@playwright/test';
import portal from './playwright.config';

export default defineConfig({
    ...portal,
    testIgnore: [],
    testMatch: 'placements.spec.ts',
    timeout: 190_000,
    outputDir: `${process.env.PORTAL_E2E_RUN}/placement-results`,
    webServer: portal.webServer ? { ...portal.webServer, env: { PORTAL_E2E_PLACEMENTS: '1' } } : undefined,
    projects: portal.projects?.map(project => project.name === 'phone'
        ? { ...project, use: { ...project.use, viewport: { width: 320, height: 844 } } }
        : project),
});
