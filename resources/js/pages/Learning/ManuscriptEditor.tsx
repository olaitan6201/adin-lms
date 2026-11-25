import { useRef, useState } from 'react';
import { Manuscript } from './Manuscript';
import type { Choice, Lesson } from './contracts';

export function ManuscriptEditor({ lesson, quizzes }: { lesson?: Lesson; quizzes: Choice[] }) {
    const [text, setText] = useState(lesson?.body || '');
    const [preview, setPreview] = useState(false);
    const input = useRef<HTMLTextAreaElement>(null);
    function insert(block: string) {
        const at = input.current?.selectionEnd ?? text.length;
        const insertion = `\n\n${block}\n\n`;
        setText(text.slice(0, at) + insertion + text.slice(at));
        requestAnimationFrame(() => {
            input.current?.focus();
            input.current?.setSelectionRange(at + insertion.length, at + insertion.length);
        });
    }
    return <fieldset className="space-y-3">
        <legend className="font-semibold">Chapter manuscript</legend>
        <p>Insert a section or write your own. Use a blank line between paragraphs and a dash for each list item.</p>
        <div className="flex flex-wrap gap-2">{['Outcomes', 'Worked example', 'Practical exercise', 'Revision questions', 'Reading list', 'Summary'].map((name) =>
            <button type="button" className="rounded border px-2 py-1" key={name} onClick={() => insert(`## ${name}`)}>{name}</button>)}</div>
        {quizzes.length > 0 && <label>Insert quiz link<select defaultValue="" onChange={(e) => {
            const quiz = quizzes.find((q) => q.id === e.target.value);
            if (quiz) insert(`[${quiz.title}](${quiz.id})`);
            e.target.value = '';
        }}><option value="">Choose a quiz</option>{quizzes.map((q) => <option value={q.id} key={q.id}>{q.title}</option>)}</select></label>}
        {!!lesson?.materials.length && <label>Insert learning resource<select defaultValue="" onChange={(e) => {
            if (e.target.value) insert(`{{resource:${e.target.value}}}`);
            e.target.value = '';
        }}><option value="">Choose a resource</option>{lesson.materials.map((m) => <option value={m.id} key={m.id}>{m.title}</option>)}</select></label>}
        <label>Lesson text (outcomes, examples, exercises and references)
            <textarea ref={input} rows={10} maxLength={250000} name="body" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <button type="button" className="underline" aria-expanded={preview} onClick={() => setPreview(!preview)}>Preview manuscript</button>
        {preview && <Manuscript text={text} />}
    </fieldset>;
}
