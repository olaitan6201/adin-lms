import { defineConfig } from '@playwright/test';
import portal from './playwright.config';

export default defineConfig({
    ...portal,
    testIgnore: [],
    testMatch: 'academic-core.spec.ts',
    webServer: portal.webServer ? { ...portal.webServer, env: { PORTAL_E2E_ACADEMIC_CORE: '1' } } : undefined,
    projects: portal.projects?.map(project => project.name === 'phone'
        ? { ...project, use: { ...project.use, viewport: { width: 320, height: 844 } } }
        : project),
});
