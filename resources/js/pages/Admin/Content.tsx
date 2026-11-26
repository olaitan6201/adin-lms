import { contentSummary, initialResources, initialModules, groups, items, contents, allowed, resourceAuthor, versionHistory } from '@/data/registry/contentLibrary';
import { useRef, useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { ResourceRegister } from '@/components/registry/ResourceRegister';
import { exportRecords, Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { Checklist, ContentPolicy } from '@/components/registry/ContentPolicy';
import { cap, Progress, Records, status, val } from '@/components/registry/Records';
import { resources } from '@/data/registry/academics';

export default function Content() {
    const desk = useDesk();
    const [tab,setTab] = useState(0);
    const [modules,setModules] = useState(initialModules);
    const [files,setFiles] = useState(initialResources);
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
        desk.show({title:m ? `${m.week} · ${m.id===contentSummary.manuscriptModule?contentSummary.manuscriptTitle:m.title}`:'Add module',subtitle:m && `${m.items} learning items · ${m.state}`,submit:'Save module',message:'Module saved',body:<><Card title="Module definition"><div className="space-y-3"><Field label="Topic title" required value={m?.title}/><Field label="Objectives" type="textarea" value={m?.objectives}/><Field label="Estimated study time" value={m?.time}/></div></Card>
            {m && <Card title="Contents" subtitle={m.id===contentSummary.manuscriptModule?'Nine items in publication order':`${m.items} learning items`}>{m.id===contentSummary.manuscriptModule && <ol className="divide-y divide-ink-100">{contents.map((c,i) => <li className="flex gap-2 py-2 text-sm" key={c}>{i+1}　{c}<small className="ml-auto">Published</small></li>)}</ol>}</Card>}</>,save:d => {
                const edit = {title:val(d,'Topic title'),objectives:val(d,'Objectives'),time:val(d,'Estimated study time')};
                setModules(ms => m ? ms.map(v => v.id===m.id?{...v,...edit}:v) : [...ms,{...edit,id:crypto.randomUUID(),week:`Week ${ms.length+1}`,state:'draft',completion:0,items:0}]);
            }});
    }
    function versions(f: typeof files[number]) {
        desk.show({title:f.name,subtitle:`${f.type} · ${f.size}${f.id===resources[0]?.name?` · attached to ${contentSummary.attachedWeek}`:''}`,submit:'Save',message:'Resource access updated',body:<><Card title="Version history" subtitle="Replacing a file keeps the previous version available"><ul className="divide-y divide-ink-100">{Array.from({length:f.latest},(_,i) => {
            const v=f.latest-i;
            const current=f.version===`v${v}`;
            return <li key={v} className="flex items-center justify-between gap-3 py-2"><div><b className="text-sm">v{v}{current?' · current':''}</b><p className="text-xs text-ink-500">{i===0?f.updated:versionHistory[Math.min(i-1,1)].date} · {resourceAuthor} · {i===0?f.size:versionHistory[Math.min(i-1,1)].size}</p></div>{current?status('In use','emerald'):v>1?<Action size="sm" onClick={() => {
                setFiles(fs => fs.map(r => r.id===f.id?{...r,version:`v${v}`}:r));
                versions({...f,version:`v${v}`});
            }}>Restore</Action>:<Action size="sm" onClick={() => exportRecords(`resource-v${v}`,[{name:f.name,version:v}])}>Download</Action>}</li>;
        })}</ul></Card><Card title="Access and downloads"><div className="space-y-3"><Field label="Visible from" type="date" value={f.from}/><Field label="Visible until" type="date" value={f.until}/><label className="block text-sm"><input type="checkbox" name="download" defaultChecked={f.download}/> Allow download on mobile and desktop</label><label className="block text-sm"><input type="checkbox" name="source" defaultChecked={f.source}/> Allow download of the source file, not only the reader view</label></div></Card></>,save:d => setFiles(fs => fs.map(r => r.id!==f.id?r:{...r,from:val(d,'Visible from'),until:val(d,'Visible until'),download:d.has('download'),source:d.has('source')}))});
    }
    return <Register title="Content library" eyebrow="Content" description="Weekly modules, chapter manuscripts and the resources attached to them, with versioning and access control." actions={<><Action icon="chart" onClick={() => exportRecords('content-report',files)}>Content report</Action><Action icon="upload" variant="primary" onClick={() => picker.current?.click()}>Upload resource</Action></>} overlay={desk.overlay} active={tab} select={setTab} tabs={[[ 'Modules and resources'],['Resource register'],['Authoring checklist']]}>
        <input type="file" hidden ref={picker} multiple aria-label="Select resources" accept={allowed.map(x => `.${x}`).join(',')} onChange={e => {upload(e.target.files); e.target.value='';}}/>
        {tab===0 && <Records tableClass="[&_th:last-child]:w-[90px] [&_td:last-child]:text-right [&_th:first-child]:w-20" title="Weekly modules" subtitle={`${contentSummary.code} · ${modules.length} modules · ${contentSummary.items} learning items`} actions={<><Action size="sm" icon="plus" onClick={() => moduleForm()}>Add module</Action><Action size="sm" icon="document" variant="primary" onClick={() => moduleForm(modules[2])}>Chapter manuscript</Action></>} columns={['Week','Module','Items','Learner progress','State','']} rows={modules.map(m => [<span className="font-mono text-[11.5px] font-medium text-ink-500">{m.week}</span>,<span className="font-medium text-ink-800">{m.title}</span>,<span className="tnum text-[13px]">{m.items}</span>,<span className="tnum"><Progress n={m.completion}/></span>,status(cap(m.state)),<Action size="sm" onClick={() => moduleForm(m)}>Edit</Action>])}/>}
        {tab !== 2 && <ResourceRegister files={files} browse={() => picker.current?.click()} upload={upload} versions={versions} />}
        {tab===2 && <Checklist items={items}/>}{tab!==0 && <ContentPolicy desk={desk} groups={groups}/>}
        <Note>Resource access can be scheduled by week and restricted by delivery mode. Replacing a file keeps the previous version available for audit and for students who downloaded it.</Note>
    </Register>;
}
