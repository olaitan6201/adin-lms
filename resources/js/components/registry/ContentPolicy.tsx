import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Field, type Desk } from './Desk';
import { Records, status, val } from './Records';

const groups = [
    ['Documents','PDF, DOCX, ODT, RTF, TXT','Type checked'],
    ['Slides and sheets','PPTX, XLSX, CSV','Type checked'],
    ['Images','PNG, JPG, SVG, WEBP','Type checked'],
    ['Audio','MP3, M4A, WAV, OGG','Media probed'],
    ['Video','MP4, WEBM, MOV','Media probed'],
    ['Source code','ZIP, TAR, GZ of .java, .py, .js, .ts, .cpp, .cs, .sql, .php, .rb, .go','Type and signature checked'],
    ['Links and embeds','External URL, LTI 1.3 activity','Type and signature checked'],
];
export function ContentPolicy({ desk }: { desk: Desk }) {
    const [rules,setRules] = useState(groups);
    return <div><Records title="Upload allow-list" subtitle="What a lecturer may attach, and the validation applied to each type" actions={<>{status('Limit 200 MB')}<Action icon="settings" size="sm" onClick={() => desk.show({title:'Edit allow-list',submit:'Save',body:rules.map(([name,types]) => <Field key={name} label={name} value={types} required/>),save:d => setRules(rs => rs.map(([name,,validation]) => [name,val(d,name),validation]))})}>Edit allow-list</Action></>} columns={['Group','Accepted types','Validation']} rows={rules.map(([name,types,validation]) => [name,types,status(validation,validation==='Media probed'?'sky':validation==='Type checked'?'slate':'emerald')])}/><p className="p-3 text-xs text-ink-500">A file outside the allow-list is rejected before it is written to storage, and the rejection is recorded as a security event. Executable types are never accepted.</p></div>;
}
export function Checklist() {
    const items = [['Course overview','Complete'],['Weekly topic modules','7 of 12 drafted'],['Chapter manuscripts','3 of 7 written'],['Worked examples','18 examples'],['Practical examples','6 worked practicals'],['Exercises and revision questions','64 questions'],['Activities','6 activities'],['Quizzes','6 quizzes'],['Summary and references','12 sources']];
    return <Card title="Authoring completeness" subtitle="Structural checks the prototype runs against the SRS content requirements"><ul className="divide-y divide-ink-100">{items.map(([label,value],i) => <li key={label} className="flex items-center justify-between gap-2 py-2 text-[13px]"><span className="flex items-center gap-2"><Icon name="check" className="size-4 text-brand-600"/>{label}</span>{status(value,i===1||i===2?'amber':'emerald')}</li>)}</ul></Card>;
}
