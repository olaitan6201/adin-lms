import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Field, type Desk } from './Desk';
import { Records, status, val } from './Records';

export function ContentPolicy({ desk, groups }: { desk: Desk; groups: string[][] }) {
    const [rules,setRules] = useState(groups);
    return <div><Records footer={<p className="mt-3 text-xs leading-relaxed text-ink-500">A file outside the allow-list is rejected before it is written to storage, and the rejection is recorded as a security event. Executable types are never accepted.</p>} title="Upload allow-list" subtitle="What a lecturer may attach, and the validation applied to each type" actions={<>{status('Limit 200 MB')}<Action icon="settings" size="sm" onClick={() => desk.show({title:'Edit allow-list',submit:'Save',body:rules.map(([name,types]) => <Field key={name} label={name} value={types} required/>),save:d => setRules(rs => rs.map(([name,,validation]) => [name,val(d,name),validation]))})}>Edit allow-list</Action></>} columns={['Group','Accepted types','Validation']} rows={rules.map(([name,types,validation]) => [name,types,status(validation,validation==='Media probed'?'sky':validation==='Type checked'?'slate':'emerald')])}/></div>;
}
export function Checklist({ items }: { items: string[][] }) {
        return <Card title="Authoring completeness" subtitle="Structural checks the prototype runs against the SRS content requirements"><ul className="divide-y divide-ink-100">{items.map(([label,value],i) => <li key={label} className="flex items-center justify-between gap-2 py-2 text-[13px]"><span className="flex items-center gap-2"><Icon name="check" className="size-4 text-brand-600"/>{label}</span>{status(value,i===1||i===2?'amber':'emerald')}</li>)}</ul></Card>;
}
