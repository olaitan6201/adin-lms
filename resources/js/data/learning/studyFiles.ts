import manuscript from '../registry/acc302-week3-v1.pdf?url';
import practiceSet from './materials/acc302-practice-set.docx?url';
import trialBalance from './materials/acc302-trial-balance.xlsx?url';
import lectureSlides from './materials/acc302-lecture-slides.pptx?url';
import archive from './materials/acc302-study-pack.zip?url';

export const studyFiles = [
    {
        id: 'week-3-manuscript',
        title: 'Week 3 manuscript (PDF)',
        href: manuscript,
        filename: 'acc302-week3-v1.pdf',
        bytes: 3042,
        course: 'ACC302',
        format: 'PDF',
    },
    {
        id: 'practice-set',
        title: 'Practice set (DOCX)',
        href: practiceSet,
        filename: 'acc302-practice-set.docx',
        bytes: 37045,
        course: 'ACC302',
        format: 'DOCX',
    },
    {
        id: 'trial-balance',
        title: 'Trial balance template (XLSX)',
        href: trialBalance,
        filename: 'acc302-trial-balance.xlsx',
        bytes: 5884,
        course: 'ACC302',
        format: 'XLSX',
    },
    {
        id: 'revenue-notes',
        title: 'Lecture slides (PPTX)',
        href: lectureSlides,
        filename: 'acc302-lecture-slides.pptx',
        bytes: 31258,
        course: 'ACC302',
        format: 'PPTX',
    },
] as const;

export const studyPack = {
    href: archive,
    filename: 'acc302-study-pack.zip',
};
