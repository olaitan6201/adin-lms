import { EntryForm, localInput } from './EntryForm';
import type { Lesson, Material } from './contracts';

function Schedule({ item }: { item?: { opens_at: string | null; closes_at: string | null } }) {
    return <><label>Available from (local time)<input name="opens_at" type="datetime-local" defaultValue={localInput(item?.opens_at)} /></label>
        <label>Available until (local time)<input name="closes_at" type="datetime-local" defaultValue={localInput(item?.closes_at)} /></label></>;
}

export function LessonForm({ base, lesson, position }: { base: string; lesson?: Lesson; position: number }) {
    return <details><summary>{lesson ? 'Edit lesson or publish' : 'Author a lesson'}</summary>
        <EntryForm action={`${base}/lessons${lesson ? `/${lesson.id}` : ''}`} label="Save lesson">
            <label>Title<input name="title" required maxLength={191} defaultValue={lesson?.title} /></label>
            <label>Order<input type="number" min="1" name="position" required defaultValue={position} /></label>
            <label>Organisation<select name="kind" defaultValue={lesson?.kind.replace('draft:', '') || 'chapter'}>{['overview','weekly','topic','chapter'].map(k => <option key={k}>{k}</option>)}</select></label>
            <label>Lesson text (outcomes, examples, exercises and references)<textarea rows={8} name="body" defaultValue={lesson?.body || ''} /></label>
            <label>Publication<select name="published" defaultValue={lesson && !lesson.kind.startsWith('draft:') ? '1' : '0'}><option value="0">Draft</option><option value="1">Publish</option></select></label>
            <Schedule item={lesson} />
        </EntryForm></details>;
}

export function ResourceForm({ action, item }: { action: string; item?: Material }) {
    return <details><summary>{item ? 'Replace resource' : 'Add a resource'}</summary><EntryForm action={action} label="Save revision">
        <label>Resource title<input name="title" required maxLength={191} defaultValue={item?.title} /></label>
        <label>Resource text<textarea name="body" /></label><label>External resource or quiz (HTTPS)<input type="url" name="external_url" /></label>
        <label>Private attachment (up to 50 MiB)<input name="file" type="file" /></label>
        <label>Learner downloads<select name="download_allowed" defaultValue={item && !item.download_allowed ? '0' : '1'}><option value="1">Allowed</option><option value="0">Disabled</option></select></label>
        <Schedule item={item} /></EntryForm></details>;
}
