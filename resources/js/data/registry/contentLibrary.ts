import { courseModules, resources } from './academics';

export const groups = [
    ['Documents','PDF, DOCX, ODT, RTF, TXT','Type checked'],
    ['Slides and sheets','PPTX, XLSX, CSV','Type checked'],
    ['Images','PNG, JPG, SVG, WEBP','Type checked'],
    ['Audio','MP3, M4A, WAV, OGG','Media probed'],
    ['Video','MP4, WEBM, MOV','Media probed'],
    ['Source code','ZIP, TAR, GZ of .java, .py, .js, .ts, .cpp, .cs, .sql, .php, .rb, .go','Type and signature checked'],
    ['Links and embeds','External URL, LTI 1.3 activity','Type and signature checked'],
];
export const items = [['Course overview','Complete'],['Weekly topic modules','7 of 12 drafted'],['Chapter manuscripts','3 of 7 written'],['Worked examples','18 examples'],['Practical examples','6 worked practicals'],['Exercises and revision questions','64 questions'],['Activities','6 activities'],['Quizzes','6 quizzes'],['Summary and references','12 sources']];
export const contents = ['Chapter manuscript','Worked example: sales on credit','Illustration: journal to ledger flow','Exercise set 3.1','Revision questions','Quiz: 10 objective items','Summary','References and further reading','Discussion prompt'];
export const allowed = 'pdf docx odt rtf txt pptx xlsx csv png jpg jpeg svg webp mp3 m4a wav ogg mp4 webm mov zip tar gz'.split(' ');
export const initialModules = courseModules.map(m => ({...m,objectives:m.id==='m-3'?'Record transactions in subsidiary books and post them to the general ledger.':'',time:'45 minutes'}));
export const initialResources = resources.map(r => ({...r,id:r.name,latest:Number(r.version.slice(1)),from:'2026-11-12',until:'2026-11-19',download:false,source:true}));
export const versionHistory = [{date:'04 Nov 2026',size:'3.0 MB'}, {date:'12 Oct 2026',size:'2.7 MB'}];
export const resourceAuthor = 'Dr. Peter Adeyemi';
export const contentSummary = {code:'ACC302', items:46, manuscriptModule:'m-3', manuscriptTitle:'Journals and ledgers', attachedWeek:'Week 3'};
