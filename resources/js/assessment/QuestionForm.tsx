import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { PortalField, SubmitButton } from '../components/PortalForm';
import type { QuestionFormValues, QuestionKind } from './contracts';

type Props = {
    action: string;
    method?: 'post' | 'put';
    initial?: Partial<QuestionFormValues>;
    submitLabel: string;
    cancelHref: string;
};

export function QuestionForm({ action, method = 'post', initial, submitLabel, cancelHref }: Props) {
    const [kind, setKind] = useState<QuestionKind>(initial?.kind ?? 'mcq');
    const choices = kind === 'mcq' || kind === 'true_false';
    const accepted = choices || kind === 'gap_fill' || kind === 'short_answer';
    const subjective = kind === 'essay' || kind === 'programming' || kind === 'practical';

    return (
        <Form action={action} method={method} className="grid min-w-0 gap-4 rounded-lg border p-4 sm:p-5 [&_button[type=submit]]:h-auto [&_button[type=submit]]:min-h-9 [&_button[type=submit]]:whitespace-normal">
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    <PortalField
                        label="Bank topic"
                        name="topic"
                        required
                        maxLength={191}
                        defaultValue={initial?.topic}
                        error={errors.topic}
                    />
                    <Label className="grid min-w-0 gap-2 leading-normal">
                        Question type
                        <NativeSelect
                            name="kind"
                            required
                            value={kind}
                            onChange={(event) => setKind(event.target.value as QuestionKind)}
                        >
                            <option value="mcq">Multiple choice</option>
                            <option value="true_false">True or false</option>
                            <option value="gap_fill">Fill the gap</option>
                            <option value="matching">Matching</option>
                            <option value="short_answer">Short answer</option>
                            <option value="essay">Essay</option>
                            <option value="programming">Programming</option>
                            <option value="practical">Practical</option>
                        </NativeSelect>
                    </Label>
                    <Label className="grid min-w-0 gap-2 leading-normal">
                        Prompt
                        <Textarea
                            name="prompt"
                            required
                            rows={5}
                            maxLength={12000}
                            defaultValue={initial?.prompt}
                        />
                    </Label>
                    {choices && (
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Choices (one per line)
                            <Textarea
                                name="options"
                                required={kind === 'mcq'}
                                rows={4}
                                defaultValue={initial?.options}
                            />
                        </Label>
                    )}
                    {accepted && (
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            {choices ? 'Accepted answer (must match a choice)' : 'Accepted answers (one per line)'}
                            <Textarea
                                name="accepted"
                                required
                                rows={choices ? 2 : 4}
                                defaultValue={initial?.accepted}
                            />
                        </Label>
                    )}
                    {kind === 'matching' && (
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Matching pairs (one left =&gt; right pair per line)
                            <Textarea
                                name="pairs"
                                required
                                rows={6}
                                defaultValue={initial?.pairs}
                            />
                        </Label>
                    )}
                    {subjective && (
                        <Label className="grid min-w-0 gap-2 leading-normal">
                            Marking guide
                            <Textarea
                                name="guide"
                                rows={4}
                                maxLength={5000}
                                defaultValue={initial?.guide}
                            />
                        </Label>
                    )}
                    {Object.entries(errors).map(([key, error]) => (
                        <p role="alert" key={key}>
                            {error}
                        </p>
                    ))}
                    <div className="flex flex-wrap items-center gap-4">
                        <SubmitButton processing={processing}>{submitLabel}</SubmitButton>
                        <Link href={cancelHref} className="underline">
                            Cancel
                        </Link>
                    </div>
                    {recentlySuccessful && <p role="status">Saved.</p>}
                </>
            )}
        </Form>
    );
}
