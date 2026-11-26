import { useRef, useState } from 'react';
import { Action, Card } from '@/components/workspace/Elements';
import { Field, Note } from './Desk';
import { Records, status } from './Records';
import { retentionRules } from './fixtures/governance';

const policy = [
    ['Require multi-factor authentication for privileged roles','Super admin, ICT, dean, head of department and examination officers',true],
    ['Idle session logout','Ends an inactive session after the configured period',true],
    ['Allow guardian access','Guardians see only progress explicitly approved by staff',false],
    ['Allow SMS and push notifications','Channel availability depends on the configured gateway',false],
    ['Record consent for personal data processing','Required where the NDPA 2023 applies to the record',true],
] as const;
const privacy = [
    ['Record consent where the data subject is not the student','Guardian and employer data captured with a consent reference',true],
    ['Restrict personal data to roles that need it','Least privilege on every query path, not only in the interface',true],
    ['Support legally required exports','An authorised officer can export a complete record for a data subject',true],
    ['Breach notification workflow','Record, contain, notify and review within the agreed window',true],
] as const;
function Switches({ items }: { items: readonly (readonly [string,string,boolean])[] }) {
    return <div className="divide-y divide-ink-100">{items.map(([label,hint,checked]) => <label key={label} className="flex cursor-pointer items-start justify-between gap-6 py-3">
        <span><strong className="block text-[13.5px] font-medium">{label}</strong><small className="mt-0.5 block text-xs leading-relaxed text-ink-500">{hint}</small></span>
        <input aria-label={label} type="checkbox" role="switch" defaultChecked={checked} className="peer sr-only"/><span aria-hidden className="relative h-5 w-9 shrink-0 rounded-full bg-ink-200 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white peer-checked:bg-brand-600 peer-checked:after:left-[18px] peer-focus-visible:ring-2"/></label>)}</div>;
}
export function Privacy() {
    return <><Card title="Data protection and retention" subtitle="Personal data is restricted, stored securely, and deleted or archived on schedule"><Switches items={privacy}/><Note>Education is treated as a designated major-importance sector for data protection purposes. The data protection officer reports to the institutional register.</Note></Card><Records title="Retention schedule" columns={['Data set','Retention','Basis']} rows={retentionRules.map(r => [r.data,r.period,r.basis])}/></>;
}
export function InstitutionSettings() {
    const picker = useRef<HTMLInputElement>(null);
    const [logo,setLogo] = useState('/brand/adin/crest.svg');
    return <><div className="grid gap-5 xl:grid-cols-2"><Card title="Institution identity" subtitle="Branding, name and the links shown across the interface"><div className="space-y-3"><Field label="Institution name" value="Adin Open University"/><Field label="System name" value="AdinOpen LMS"/><Field label="Support email" type="email" value="helpdesk@adin-u.com"/>
        <div><p className="mb-1 text-[13px] font-medium">Logo</p><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl border border-ink-100"><img className="max-h-9 max-w-9" src={logo} alt="Institution crest"/></span><Action size="sm" onClick={() => picker.current?.click()}>Replace logo</Action><input hidden ref={picker} type="file" aria-label="Institution logo" accept="image/png,image/jpeg,image/webp" onChange={e => {
            const f=e.target.files?.[0];
            if (!f || !['image/png','image/jpeg','image/webp'].includes(f.type)) return;
            const reader=new FileReader();
            reader.onload=() => setLogo(String(reader.result));
            reader.readAsDataURL(f);
        }}/></div></div></div></Card>
        <Card title="Platform policy" subtitle="Defaults that apply to every user and course"><Switches items={policy}/><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Idle timeout" options={['30 minutes','15 minutes','60 minutes']}/><Field label="Upload limit" options={['200 MB','100 MB','500 MB']}/></div></Card></div>
        <Card title="Progressive web app" subtitle="The decided mobile strategy for the platform" actions={<>{status('Installable','emerald')}{status('Offline shell','sky')}</>}>
            <div className="grid gap-3 lg:grid-cols-2">{[['manifest.webmanifest','Name, icons, colours and shortcuts for the installed application.'],['Service worker','Caches the application shell so a cold start works without a network.'],['Icon set','192, 512 and maskable PNG icons rendered from the institutional crest.'],['Install control','In the navigation footer, with a plain explanation when the browser cannot offer a prompt.']].map(([label,text]) => <div key={label} className="rounded-xl border border-ink-100 p-3.5"><p className="text-[13px] font-semibold">{label}</p><p className="mt-1 text-xs text-ink-500">{text}</p></div>)}</div>
            <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50 p-4"><b className="text-[13px]">What the PWA route does not settle</b><ul className="mt-2 list-disc space-y-1 pl-5 text-xs"><li>A store-published native build is a separate procurement decision and is not implied here.</li><li>Push delivery needs a push service and is not implemented by this prototype.</li><li>Offline access caches the shell and the resources a student has already downloaded; it is not a low bandwidth mode.</li></ul></div></Card></>;
}
