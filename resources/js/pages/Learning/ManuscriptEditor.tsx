import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useRef, useState } from 'react';
import { Manuscript } from './Manuscript';
import type { Choice, Lesson } from './contracts';

type ManuscriptEditorProps = {
    lesson?: Lesson;
    quizzes: Choice[];
};

export function ManuscriptEditor({ lesson, quizzes }: ManuscriptEditorProps) {
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

    return (
        <fieldset className="space-y-3">
            <legend className="font-semibold">Chapter manuscript</legend>
            <p>
                Insert a section or write your own. Use a blank line between paragraphs and a dash for each list item.
            </p>
            <div className="flex flex-wrap gap-2">
                {[
                    'Outcomes',
                    'Worked example',
                    'Practical exercise',
                    'Revision questions',
                    'Reading list',
                    'Summary',
                ].map((name) => (
                    <Button variant="outline"
                        type="button"
                        key={name}
                        onClick={() => insert(`## ${name}`)}
                    >
                        {name}
                    </Button>
                ))}
            </div>
            {quizzes.length > 0 && (
                <label>
                    Insert quiz link
                    <NativeSelect
                        defaultValue=""
                        onChange={(e) => {
                            const quiz = quizzes.find((q) => q.id === e.target.value);
                            if (quiz) insert(`[${quiz.title}](${quiz.id})`);

                            e.target.value = '';
                        }}
                    >
                        <option value="">Choose a quiz</option>
                        {quizzes.map((q) => (
                            <option value={q.id} key={q.id}>
                                {q.title}
                            </option>
                        ))}
                    </NativeSelect>
                </label>
            )}
            {!!lesson?.materials.length && (
                <label>
                    Insert learning resource
                    <NativeSelect
                        defaultValue=""
                        onChange={(e) => {
                            if (e.target.value) insert(`{{resource:${e.target.value}}}`);

                            e.target.value = '';
                        }}
                    >
                        <option value="">Choose a resource</option>
                        {lesson.materials.map((m) => (
                            <option value={m.id} key={m.id}>
                                {m.title}
                            </option>
                        ))}
                    </NativeSelect>
                </label>
            )}
            <label>
                Lesson text (outcomes, examples, exercises and references)
                <Textarea
                    ref={input}
                    rows={10}
                    maxLength={250000}
                    name="body"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </label>
            <Button variant="outline" type="button" aria-expanded={preview} onClick={() => setPreview(!preview)}>
                Preview manuscript
            </Button>
            {preview && <Manuscript text={text} />}
        </fieldset>
    );
}
