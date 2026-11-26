import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// Explicit public workspace route names. Never infer eligibility from a role prefix.
const modules = {
    admin: 'overview structure people curriculum delivery content course classroom assignments cbt gradebook attendance communication calendar reports qa administration settings.notifications',
    lecturer: 'overview courses course classroom assignments cbt gradebook attendance communication calendar reports settings.notifications',
    student: 'overview courses course assignments exam results downloads communication calendar settings.notifications',
    guardian: 'progress settings.notifications',
    auth: 'signin recover',
};
const aliases = { 'admin/qa': 'admin/qa-review', 'student/downloads': 'student/offline-downloads' };
const root = new URL('../../public/', import.meta.url);
const read = path => readFile(new URL(path, root));
const hash = bytes => createHash('sha256').update(bytes).digest('base64');

export async function buildFixtureRelease() {
    const manifest = JSON.parse(await read('build/manifest.json'));
    const sampleFiles = new Set(Object.entries(manifest)
        .filter(([source]) => source === 'resources/js/data/registry/acc302-week3-v1.pdf' ||
            /^resources\/js\/data\/learning\/materials\/[\w-]+\.(?:docx|xlsx|pptx|zip)$/.test(source))
        .map(([, asset]) => asset.file));
    const assets = new Set(['/brand/adin/crest.svg', '/workspace.webmanifest', '/portal-192.png',
        '/portal-512.png', '/portal-maskable-512.png', '/apple-touch-icon.png']);
    const visited = new Set();
    function include(key) {
        if (visited.has(key)) return;
        visited.add(key);
        const chunk = manifest[key];
        for (const file of [chunk.file, ...chunk.css ?? [], ...chunk.assets ?? []]) {
            const sample = sampleFiles.has(file) && /^assets\/[\w.-]+\.(?:pdf|docx|xlsx|pptx|zip)$/.test(file);
            if (!sample && !/^assets\/[\w.-]+\.(js|css|woff2)$/.test(file)) {
                throw new Error(`Unexpected asset: ${file}`);
            }
            assets.add(`/build/${file}`);
        }
        // Follow static dependencies only. Other application pages are dynamic imports.
        for (const dependency of chunk.imports ?? []) include(dependency);
    }

    const entry = 'resources/js/app.tsx';
    include(entry);
    const pages = {};
    for (const [role, list] of Object.entries(modules)) {
        for (const module of list.split(' ')) {
            const screen = `${role}/${module.replaceAll('.', '/')}`;
            const component = screen === 'guardian/progress' ? 'Guardian/ApprovedProgress'
                : screen.split('/').map(word => word[0].toUpperCase() + word.slice(1)).join('/');
            include(`resources/js/pages/${component}.tsx`);
            pages[`/${aliases[screen] ?? screen}`] = { component, screen };
        }
    }
    for (const [role, codes] of Object.entries({
        student: ['ACC302', 'BSC205', 'ENG210', 'MTH112'],
        lecturer: ['ACC302', 'BSC205', 'ENG210', 'CHM401'],
    })) {
        const path = `/${role}/course`;
        for (const code of codes) pages[`${path}?course=${code}`] = pages[path];
    }

    const files = {};
    for (const path of [...assets].sort()) {
        files[path] = `sha256-${hash(await read(path.slice(1)))}`;
    }
    const release = {
        pages, files, entry: `/build/${manifest[entry].file}`,
        styles: manifest[entry].css.map(file => `/build/${file}`),
    };
    const version = createHash('sha256').update(JSON.stringify(release)).digest('hex');
    await writeFile(new URL('build/fixture-release.js', root),
        `self.fixtureRelease = ${JSON.stringify({ ...release, version })};\n`);
}
