import { staffDirectory, studentDirectory, devices, learningHistory, studentMetrics, directorySummary } from '@/data/registry/directory';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { exportRecords, Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { cap, Details, Metrics, Records, status, val } from '@/components/registry/Records';
import { roleMatrix, permissionMatrix } from '@/data/registry/institution';

function Avatar({ name, large = false }: { name: string; large?: boolean }) {
    const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
    const colors = ['bg-brand-100 text-brand-800','bg-sky-100 text-sky-800','bg-amber-100 text-amber-800','bg-rose-100 text-rose-800','bg-ink-200 text-ink-700'];
    return <span aria-hidden className={`grid shrink-0 place-items-center rounded-full font-semibold ${large?'size-11 text-sm':'size-7 text-[10px]'} ${colors[name.length%colors.length]}`}>{initials}</span>;
}
function Person({ name, id }: { name: string; id: string }) {
    return <div className="flex items-center gap-2.5"><Avatar name={name}/><div className="min-w-0"><p className="truncate text-[13px] font-medium text-ink-800">{name}</p><p className="truncate text-[11px] text-ink-400">{id}</p></div></div>;
}
function Sessions({ devices }: { devices:string[][] }) {
    const [revoked, revoke] = useState(false);
    return <Card title="Active sessions" subtitle="Revoke any session that should no longer be valid"><ul className="divide-y divide-ink-100">{devices.map(([title,detail],i) => <li key={title} className="flex items-center justify-between gap-3 py-2"><div><p className="text-[13px] font-medium text-ink-800">{title}</p><p className="text-xs text-ink-500">{detail}</p></div>{i===0 ? status('Current','emerald') : revoked ? status('Revoked') : <Action size="sm" onClick={() => revoke(true)}>Revoke</Action>}</li>)}</ul></Card>;
}
export default function People() {
    const desk = useDesk();
    const [tab, setTab] = useState(0);
    const [staff, setStaff] = useState(staffDirectory);
    const [students, setStudents] = useState(studentDirectory);
    const [query, search] = useState('');
    const [filter, setFilter] = useState('All statuses');
    const visible = staff.filter(s => (filter === 'All statuses' || s.status === filter) && [s.name,s.id,s.unit].join(' ').toLowerCase().includes(query.toLowerCase()));
    function editStaff(s?: typeof staff[number]) {
        desk.show({title:s?.name ?? 'Add person',portrait:s && <Avatar name={s.name} large/>,subtitle:s ? `${s.role} · ${s.unit}` : undefined, submit:'Save changes',message:'User record updated',body:<>
            {s && <div className="flex flex-wrap gap-2">{status(s.role,'emerald')}{status(s.mfa?'MFA enrolled':'Not enrolled',s.mfa?'emerald':'amber')}{status(cap(s.status))}{status('Sessions: 2')}</div>}
            <Card title="Identity"><div className="grid gap-3 sm:grid-cols-2">{s ? <Field label="Staff ID" value={s.id === directorySummary.superAdminId ? directorySummary.staffNumber : s.id.toUpperCase()} readOnly/> : <><Field label="Name" required/><Field label="Unit" required/></>}<Field label="Email" type="email" value={s?.email}/><Field label="Role" value={s?.role} options={s?.role==='Super Admin' ? ['Super Admin','ICT Manager'] : roleMatrix.filter(r => r.role !== 'Student').map(r => r.role)}/><Field label="Idle logout" value={s?.idle} options={['30 minutes','15 minutes','60 minutes']}/></div></Card>{s && <Sessions devices={devices}/>}<Note amber>Privileged roles must enrol in multi-factor authentication. Password recovery resets the secret and revokes every active session.</Note></>,save:d => {
                const edits = {email:val(d,'Email'),role:val(d,'Role'),idle:val(d,'Idle logout')};
                setStaff(all => s ? all.map(p => p.id === s.id ? {...p,...edits} : p) : [...all,{...edits,id:`u-${all.length+1}`,name:val(d,'Name'),unit:val(d,'Unit'),mfa:false,lastActive:'Never',status:'active'}]);
            }});
    }
    function editStudent(s: typeof students[number]) {
        desk.show({title:s.name,portrait:<Avatar name={s.name} large/>,subtitle:s.matric,submit:'Save changes',message:'Student profile saved',body:<><div className="grid gap-3 sm:grid-cols-2"><Field label="Programme" value={s.programme} required/><Field label="Level" value={s.level} options={Array.from(new Set([String(s.level),'300','200','100']))}/><Field label="Email" value={s.email} type="email"/><Field label="Status" value={cap(s.status)} options={Array.from(new Set(['Active','At risk','Suspended',cap(s.status)]))}/></div><Card title="Learning history" subtitle="Enrolment and performance retained across sessions">{s.id === directorySummary.historyStudentId ? <Details entries={learningHistory}/> : 'No history shown.'}</Card><Note>Guardian access is off for this student. A guardian view can be enabled only with recorded consent.</Note></>, save:d => setStudents(all => all.map(p => p.id !== s.id ? p : {...p,email:val(d,'Email'),status:val(d,'Status').toLowerCase(),programme:val(d,'Programme'),level:Number(val(d,'Level'))}))});
    }
    return <Register eyebrow="Identity and authority" title="People and roles" description="Staff, student profiles and the permissions that decide who can see and change what." overlay={desk.overlay} actions={<><Action icon="lock" onClick={() => desk.show({title:'Session monitor',body:<Sessions devices={devices}/>})}>Session monitor</Action><Action icon="userPlus" variant="primary" onClick={() => editStaff()}>Add person</Action></>} tabs={[[ 'Staff and administrators',directorySummary.staff],['Students',directorySummary.students],['Roles and permissions',directorySummary.roles]]} active={tab} select={setTab}>
        {tab === 0 && <Records tableClass="[&_th:last-child]:w-[100px] [&_td:last-child]:text-right" title="Staff and administrators" subtitle="Roles that carry oversight, academic or technical authority" actions={<>{status(`${visible.length} shown`)}<Action variant="primary" size="sm" icon="userPlus" onClick={() => editStaff()}>Invite user</Action></>} columns={['Person','Role','Unit','MFA','Last active','Status','']} rows={visible.map(s => [<Person name={s.name} id={s.id.toUpperCase()}/>,status(s.role,s.role === 'Super Admin'?'emerald':'slate'),<span className="text-[13px] text-ink-600">{s.unit}</span>,status(s.mfa?'Enrolled':'Not enrolled',s.mfa?'emerald':'amber'),<span className="text-[13px] text-ink-500">{s.lastActive}</span>,status(cap(s.status)),<Action size="sm" onClick={() => editStaff(s)}>Details</Action>])}>
            <div className="mb-4 flex flex-wrap items-center gap-2"><div className="relative min-w-[220px] flex-1"><Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"/><input className="input pl-9" aria-label="Search staff" value={query} onChange={e => search(e.target.value)} placeholder="Search by name, staff ID or unit"/></div><Action size="sm" icon="filter" onClick={() => desk.show({title:'Filters',body:<Field label="Status" value={filter} options={['All statuses','active','suspended']}/>,submit:'Apply filters',save:d => setFilter(val(d,'Status'))})}>Filters</Action><Action size="sm" icon="download" onClick={() => exportRecords('staff',visible)}>Export</Action></div></Records>}
        {tab === 1 && <Records tableClass="[&_th:last-child]:w-[90px] [&_td:last-child]:text-right" title="Student records" subtitle="Provisioned learning profiles linked to the enrolment feed" actions={<>{status(`${directorySummary.students.toLocaleString('en-US')} total`,'emerald')}<Action variant="primary" size="sm" icon="upload" onClick={() => desk.show({title:'Import roster',body:<Field label="Roster file" type="file" required/>,submit:'Import',message:'Roster file selected for review'})}>Import roster</Action></>} columns={['Student','Programme','Level','Attendance','GPA','Status','']} rows={students.map(s => [<Person name={s.name} id={s.matric}/>,s.programme,status(`Level ${s.level}`),`${s.attendance}%`,s.gpa ? s.gpa.toFixed(2):'-',status(s.status === 'pending'?'Pending activation':cap(s.status),s.status==='active'?'emerald':s.status==='pending'?'sky':'amber'),<Action size="sm" onClick={() => editStudent(s)}>Open</Action>])}><Metrics rows={studentMetrics}/></Records>}
        {tab === 2 && <><Records title="Role register" subtitle="Every role carries an explicit scope and module entitlement" columns={['Role','Users','Scope','Modules','MFA']} rows={roleMatrix.map(r => [r.role,r.users,r.scope,r.modules,status(r.mfa,r.mfa==='Required'?'emerald':'slate')])}/><Records bodyClassName="p-0" title="Permission matrix" subtitle="Read as: full access, named scope, or no access" columns={['Permission','Super Admin','Inst. Admin','ICT','Dean','HoD','Lecturer','Student']} rows={permissionMatrix.map(({permission,...rights}) => [permission,...Object.values(rights).map(v => typeof v === 'boolean' ? <span aria-label={v?'Full access':'No access'}><Icon name={v?'check':'close'} className={v?'size-4 text-brand-600':'size-3.5 text-ink-300'}/></span> : v)])}/></>}
    </Register>;
}
