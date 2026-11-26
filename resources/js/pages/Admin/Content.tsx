import { useRef, useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { exportRecords, Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { Checklist, ContentPolicy } from '@/components/registry/ContentPolicy';
import { cap, Progress, Records, status, val } from '@/components/registry/Records';
import { courseModules, resources } from '@/components/registry/fixtures/academics';

const contents = ['Chapter manuscript','Worked example: sales on credit','Illustration: journal to ledger flow','Exercise set 3.1','Revision questions','Quiz: 10 objective items','Summary','References and further reading','Discussion prompt'];
const allowed = 'pdf docx odt rtf txt pptx xlsx csv png jpg jpeg svg webp mp3 m4a wav ogg mp4 webm mov zip tar gz'.split(' ');
export default function Content() {
    const desk = useDesk();
    const [tab,setTab] = useState(0);
    const [modules,setModules] = useState(courseModules.map(m => ({...m,objectives:m.id==='m-3'?'Record transactions in subsidiary books and post them to the general ledger.':'',time:'45 minutes'})));
    const [files,setFiles] = useState(resources.map(r => ({...r,id:r.name,latest:Number(r.version.slice(1)),from:'2026-11-12',until:'2026-11-19',download:false,source:true})));
    const picker = useRef<HTMLInputElement>(null);
    function upload(incoming: FileList | null) {
        if (!incoming?.length) return;
        const batch = Array.from(incoming);
        if (batch.some(f => f.size>200*1024*1024 || !allowed.includes(f.name.split('.').pop()!.toLowerCase()))) {
            desk.notify('Upload rejected. Select an allowed file type no larger than 200 MB.');
            return;
        }
        setFiles(fs => [...fs,...batch.map(f => ({id:crypto.randomUUID(),name:f.name,type:f.name.split('.').pop()!.toUpperCase(),size:`${Math.ceil(f.size/1024)} KB`,version:'v1',latest:1,updated:'Just now',access:'Open',icon:'document',from:'',until:'',download:false,source:true}))]);
        setTab(1);
        desk.notify(`${batch.length} resource(s) added`);
    }
    function moduleForm(m?: typeof modules[number]) {
        desk.show({title:m ? `${m.week} · ${m.id==='m-3'?'Journals and ledgers':m.title}`:'Add module',subtitle:m && `${m.items} learning items · ${m.state}`,submit:'Save module',message:'Module saved',body:<><Card title="Module definition"><div className="space-y-3"><Field label="Topic title" required value={m?.title}/><Field label="Objectives" type="textarea" value={m?.objectives}/><Field label="Estimated study time" value={m?.time}/></div></Card>
            {m && <Card title="Contents" subtitle={m.id==='m-3'?'Nine items in publication order':`${m.items} learning items`}>{m.id==='m-3' && <ol className="divide-y divide-ink-100">{contents.map((c,i) => <li className="flex gap-2 py-2 text-sm" key={c}>{i+1}　{c}<small className="ml-auto">Published</small></li>)}</ol>}</Card>}</>,save:d => {
                const edit = {title:val(d,'Topic title'),objectives:val(d,'Objectives'),time:val(d,'Estimated study time')};
                setModules(ms => m ? ms.map(v => v.id===m.id?{...v,...edit}:v) : [...ms,{...edit,id:crypto.randomUUID(),week:`Week ${ms.length+1}`,state:'draft',completion:0,items:0}]);
            }});
    }
    function versions(f: typeof files[number]) {
        desk.show({title:f.name,subtitle:`${f.type} · ${f.size}${f.id===resources[0].name?' · attached to Week 3':''}`,submit:'Save',message:'Resource access updated',body:<><Card title="Version history" subtitle="Replacing a file keeps the previous version available"><ul className="divide-y divide-ink-100">{Array.from({length:f.latest},(_,i) => {
            const v=f.latest-i;
            const current=f.version===`v${v}`;
            return <li key={v} className="flex items-center justify-between gap-3 py-2"><div><b className="text-sm">v{v}{current?' · current':''}</b><p className="text-xs text-ink-500">{i===0?f.updated:i===1?'04 Nov 2026':'12 Oct 2026'} · Dr. Peter Adeyemi · {i===0?f.size:i===1?'3.0 MB':'2.7 MB'}</p></div>{current?status('In use','emerald'):v>1?<Action size="sm" onClick={() => {
                setFiles(fs => fs.map(r => r.id===f.id?{...r,version:`v${v}`}:r));
                versions({...f,version:`v${v}`});
            }}>Restore</Action>:<Action size="sm" onClick={() => exportRecords(`resource-v${v}`,[{name:f.name,version:v}])}>Download</Action>}</li>;
        })}</ul></Card><Card title="Access and downloads"><div className="space-y-3"><Field label="Visible from" type="date" value={f.from}/><Field label="Visible until" type="date" value={f.until}/><label className="block text-sm"><input type="checkbox" name="download" defaultChecked={f.download}/> Allow download on mobile and desktop</label><label className="block text-sm"><input type="checkbox" name="source" defaultChecked={f.source}/> Allow download of the source file, not only the reader view</label></div></Card></>,save:d => setFiles(fs => fs.map(r => r.id!==f.id?r:{...r,from:val(d,'Visible from'),until:val(d,'Visible until'),download:d.has('download'),source:d.has('source')}))});
    }
    const button = <Action icon="upload" size="sm" variant="primary" onClick={() => picker.current?.click()}>Upload resource</Action>;
    return <Register title="Content library" eyebrow="Content" description="Weekly modules, chapter manuscripts and the resources attached to them, with versioning and access control." actions={<><Action icon="chart" onClick={() => exportRecords('content-report',files)}>Content report</Action><Action icon="upload" variant="primary" onClick={() => picker.current?.click()}>Upload resource</Action></>} overlay={desk.overlay} active={tab} select={setTab} tabs={[[ 'Modules and resources'],['Resource register'],['Authoring checklist']]}>
        <input type="file" hidden ref={picker} multiple aria-label="Select resources" accept={allowed.map(x => `.${x}`).join(',')} onChange={e => {upload(e.target.files); e.target.value='';}}/>
        {tab===0 && <Records title="Weekly modules" subtitle={`ACC302 · ${modules.length} modules · 46 learning items`} actions={<><Action size="sm" icon="plus" onClick={() => moduleForm()}>Add module</Action><Action size="sm" icon="document" variant="primary" onClick={() => moduleForm(modules[2])}>Chapter manuscript</Action></>} columns={['Week','Module','Items','Learner progress','State','']} rows={modules.map(m => [m.week,m.title,m.items,<Progress n={m.completion}/>,status(cap(m.state)),<Action size="sm" onClick={() => moduleForm(m)}>Edit</Action>])}/>}
        {tab!==2 && <Records title="Resources" subtitle="Files, links and embeds attached to the course with their access rule" actions={<>{status('Upload limit 200 MB')}{button}</>} columns={['Resource','Version','Updated','Access','']} rows={files.map(f => [<div className="flex items-center gap-3"><Icon name={f.icon} className="size-4"/><div>{f.name}<p className="text-xs text-ink-500">{f.type} · {f.size}</p></div></div>,status(f.version,f.version==='v1'?'slate':'sky'),f.updated,status(f.access,f.access==='Open'?'emerald':'amber'),<Action size="sm" onClick={() => versions(f)}>Versions</Action>])}><button className="mb-4 w-full rounded-xl border-2 border-dashed border-ink-200 p-5 text-center" onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); upload(e.dataTransfer.files);}} onClick={() => picker.current?.click()}><Icon name="upload" className="mx-auto size-5"/><b className="text-sm">Drop files to upload</b><p className="text-xs text-ink-500">PDF, DOCX, PPTX, XLSX, images, audio, video, ZIP and source code up to 200 MB</p></button></Records>}
        {tab===2 && <Checklist/>}{tab!==0 && <ContentPolicy desk={desk}/>}
        <Note>Resource access can be scheduled by week and restricted by delivery mode. Replacing a file keeps the previous version available for audit and for students who downloaded it.</Note>
    </Register>;
}
