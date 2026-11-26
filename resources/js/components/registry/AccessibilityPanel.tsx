import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Note } from './Desk';
import { Metrics, Records, status } from './Records';
type Check = {item: string; detail: string};

export function AccessibilityPanel({verified, targets, accessibilitySummary, shortcuts}: {verified: Check[]; targets: Check[]; accessibilitySummary: [string,string,string?][]; shortcuts: string[][]}) {
    return <><Note amber>This is a self-check against the build harness, not a WCAG conformance report. A conformance claim needs a documented test with assistive technology and a published report; neither exists for this artefact.</Note>
        <Card title="Accessibility target" subtitle="The standard the institution has adopted for the platform" actions={<>{status('WCAG 2.2 AA','sky')}<a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Icon name="external" className="size-4"/>Open the standard</a></>}>
            <p className="mb-4 max-w-3xl text-[13.5px] leading-relaxed text-ink-700">The platform is designed against Web Content Accessibility Guidelines 2.2 at level AA, with the comparable European standard EN 301 549 and the Section 508 rules noted where a US-funded programme requires them.</p>
            <Metrics rows={accessibilitySummary}/></Card>
        <div className="grid gap-5 xl:grid-cols-2">{[verified,targets].map((rows,i) => <Card key={i} title={i?'Target, not yet evidenced':'Verified in this build'} subtitle={i?'Requires manual testing before any conformance claim is made':'Checked automatically on every build by the render harness'}><ul className="space-y-2.5">{rows.map(r => <li key={r.item} className="flex items-start gap-2.5"><Icon name={i?'alert':'check'} className={`mt-1 size-4 shrink-0 ${i?'text-amber-700':'text-brand-700'}`}/><div><p className="text-[13px] font-medium">{r.item}</p><p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">{r.detail}</p></div></li>)}</ul></Card>)}</div>
        <Records title="Keyboard map" subtitle="The shortcuts a keyboard user needs to know" columns={['Keys','Action']} rows={shortcuts.map(([k,v]) => [<kbd className="kbd">{k}</kbd>,v])}/></>;
}
