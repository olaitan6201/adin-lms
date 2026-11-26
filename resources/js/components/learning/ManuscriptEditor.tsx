import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useRef, useState, type ChangeEvent } from 'react';
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

    function insertQuiz(event: ChangeEvent<HTMLSelectElement>) {
        const quiz = quizzes.find((choice) => choice.id === event.currentTarget.value);
        if (quiz) {
            insert(`[${quiz.title}](${quiz.id})`);
        }

        event.currentTarget.value = '';
    }

    function insertResource(event: ChangeEvent<HTMLSelectElement>) {
        const resourceId = event.currentTarget.value;
        if (resourceId) {
            insert(`{{resource:${resourceId}}}`);
        }

        event.currentTarget.value = '';
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
                    <Button
                        variant="outline"
                        type="button"
                        key={name}
                        onClick={() => insert(`## ${name}`)}
                    >
                        {name}
                    </Button>
                ))}
            </div>
            {quizzes.length > 0 && (
                <Label className="grid gap-2">
                    Insert quiz link
                    <NativeSelect defaultValue="" onChange={insertQuiz}>
                        <NativeSelectOption value="">Choose a quiz</NativeSelectOption>
                        {quizzes.map((q) => (
                            <NativeSelectOption value={q.id} key={q.id}>
                                {q.title}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
            )}
            {!!lesson?.materials.length && (
                <Label className="grid gap-2">
                    Insert learning resource
                    <NativeSelect defaultValue="" onChange={insertResource}>
                        <NativeSelectOption value="">Choose a resource</NativeSelectOption>
                        {lesson.materials.map((m) => (
                            <NativeSelectOption value={m.id} key={m.id}>
                                {m.title}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
            )}
            <Label className="grid gap-2">
                Lesson text (outcomes, examples, exercises and references)
                <Textarea
                    ref={input}
                    rows={10}
                    maxLength={250000}
                    name="body"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </Label>
            <Button
                variant="outline"
                type="button"
                aria-expanded={preview}
                onClick={() => setPreview(!preview)}
            >
                Preview manuscript
            </Button>
            {preview && <Manuscript text={text} />}
        </fieldset>
    );
}
