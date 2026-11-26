import { useRef, useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Field, Note } from './Desk';
import { Records, status } from './Records';
type SwitchList = readonly (readonly [string,string,boolean])[];

function Switches({ items }: { items: readonly (readonly [string,string,boolean])[] }) {
    return <div>{items.map(([label,hint,checked]) => <label key={label} className="flex cursor-pointer items-start justify-between gap-6 border-ink-100 py-3 not-first:border-t">
        <span><strong className="block text-[13.5px] font-medium text-ink-800">{label}</strong><small className="mt-0.5 block text-xs leading-relaxed text-ink-500">{hint}</small></span>
        <span className="relative inline-flex shrink-0 items-center">
            <input aria-label={label} type="checkbox" role="switch" defaultChecked={checked} className="peer sr-only"/>
            <span aria-hidden className="h-5 w-9 rounded-full bg-ink-200 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2"/>
            <span aria-hidden className="absolute left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"/>
        </span></label>)}</div>;
}
export function Privacy({ privacy, retentionRules }: { privacy: SwitchList; retentionRules: {data:string;period:string;basis:string}[] }) {
    return <><Card title="Data protection and retention" subtitle="Personal data is restricted, stored securely, and deleted or archived on schedule"><Switches items={privacy}/><Note>Education is treated as a designated major-importance sector for data protection purposes. The data protection officer reports to the institutional register.</Note></Card><Records title="Retention schedule" columns={['Data set','Retention','Basis']} rows={retentionRules.map(r => [r.data,r.period,r.basis])}/></>;
}
export function InstitutionSettings({ policy, identity, features }: { policy: SwitchList; identity: {name:string;system:string;email:string;logo:string}; features: string[][] }) {
    const picker = useRef<HTMLInputElement>(null);
    const [logo,setLogo] = useState(identity.logo);
    return <><div className="grid gap-5 xl:grid-cols-2"><Card title="Institution identity" subtitle="Branding, name and the links shown across the interface"><div className="space-y-3"><Field label="Institution name" value={identity.name}/><Field label="System name" value={identity.system}/><Field label="Support email" type="email" value={identity.email}/>
        <div><p className="label">Logo</p><div className="flex items-center gap-3 [&_.btn-sm]:leading-5"><span className="grid size-11 place-items-center rounded-xl border border-ink-100"><img className="h-9 w-auto" src={logo} alt="Institution crest"/></span><Action size="sm" onClick={() => picker.current?.click()}>Replace logo</Action><input hidden ref={picker} type="file" aria-label="Institution logo" accept="image/png,image/jpeg,image/webp" onChange={e => {
            const f=e.target.files?.[0];
            if (!f || !['image/png','image/jpeg','image/webp'].includes(f.type)) return;
            const reader=new FileReader();
            reader.onload=() => setLogo(String(reader.result));
            reader.readAsDataURL(f);
        }}/></div></div></div></Card>
        <Card title="Platform policy" subtitle="Defaults that apply to every user and course"><Switches items={policy}/><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Idle timeout" options={['30 minutes','15 minutes','60 minutes']}/><Field label="Upload limit" options={['200 MB','100 MB','500 MB']}/></div></Card></div>
        <Card title="Progressive web app" subtitle="The decided mobile strategy for the platform" actions={<>{status('Installable','emerald')}{status('Offline shell','sky')}</>}>
            <div className="grid gap-3 lg:grid-cols-2">{features.map(([label,text]) => <div key={label} className="rounded-xl border border-ink-100 p-3.5"><p className="text-[13px] font-semibold">{label}</p><p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{text}</p></div>)}</div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-amber-900"><p className="text-[13px] font-semibold">What the PWA route does not settle</p><ul className="mt-1.5 space-y-1 text-[12.5px] leading-relaxed"><li>A store-published native build is a separate procurement decision and is not implied here.</li><li>Push delivery needs a push service and is not implemented by this prototype.</li><li>Offline access caches the shell and the resources a student has already downloaded; it is not a low bandwidth mode.</li></ul></div></Card></>;
}
