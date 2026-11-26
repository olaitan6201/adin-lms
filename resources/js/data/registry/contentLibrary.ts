import type { UploadGroup } from '@/types/registry/content';
import { courseModules, resources } from './academics';
export { default as manuscriptV1 } from './acc302-week3-v1.pdf?inline';

export const groups: UploadGroup[] = [
    {
        id: 'documents',
        label: 'Documents',
        extensions: 'pdf docx odt rtf txt'.split(' '),
        validation: 'Type checked',
    },
    {
        id: 'slides',
        label: 'Slides and sheets',
        extensions: 'pptx xlsx csv'.split(' '),
        validation: 'Type checked',
    },
    { id: 'images', label: 'Images', extensions: 'png jpg jpeg svg webp'.split(' '), validation: 'Type checked' },
    { id: 'audio', label: 'Audio', extensions: 'mp3 m4a wav ogg'.split(' '), validation: 'Media probed' },
    { id: 'video', label: 'Video', extensions: 'mp4 webm mov'.split(' '), validation: 'Media probed' },
    {
        id: 'archives',
        label: 'Source code',
        extensions: ['zip', 'tar', 'gz'],
        description: 'Source code in archives only',
        validation: 'Type and signature checked',
    },
    {
        id: 'links',
        label: 'Links and embeds',
        description: 'External URL, LTI 1.3 activity',
        validation: 'Type and signature checked',
    },
];
export const items = [
    ['Course overview', 'Complete'],
    ['Weekly topic modules', '7 of 12 drafted'],
    ['Chapter manuscripts', '3 of 7 written'],
    ['Worked examples', '18 examples'],
    ['Practical examples', '6 worked practicals'],
    ['Exercises and revision questions', '64 questions'],
    ['Activities', '6 activities'],
    ['Quizzes', '6 quizzes'],
    ['Summary and references', '12 sources'],
];
export const contents = [
    'Chapter manuscript',
    'Worked example: sales on credit',
    'Illustration: journal to ledger flow',
    'Exercise set 3.1',
    'Revision questions',
    'Quiz: 10 objective items',
    'Summary',
    'References and further reading',
    'Discussion prompt',
];
export const initialModules = courseModules.map((m) => ({
    ...m,
    objectives:
        m.id === 'm-3' ? 'Record transactions in subsidiary books and post them to the general ledger.' : '',
    time: '45 minutes',
}));
export const initialResources = resources.map((r) => ({
    ...r,
    id: r.name,
    latest: Number(r.version.slice(1)),
    from: '2026-11-12',
    until: '2026-11-19',
    download: false,
    source: true,
}));
export const versionHistory = [
    { date: '04 Nov 2026', size: '3.0 MB' },
    { date: '12 Oct 2026', size: '2.7 MB' },
];
export const resourceAuthor = 'Dr. Peter Adeyemi';
export const contentSummary = {
    code: 'ACC302',
    items: 46,
    manuscriptModule: 'm-3',
    manuscriptTitle: 'Journals and ledgers',
    attachedWeek: 'Week 3',
};
