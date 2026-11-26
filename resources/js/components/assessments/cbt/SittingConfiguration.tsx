import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/layout/Card';
import type { Exam, SittingDraft, BlueprintData } from '@/types/assessments/cbt';
import { type Values, type FieldSpec, Fields } from '../Editor';
import { windowError } from './sittingWindow';

export function SittingConfiguration({
    exam,
    data,
    save,
}: {
    exam?: Exam;
    data: BlueprintData;
    save: (draft: SittingDraft) => void;
}) {
    const fields: FieldSpec[] = [
        ...(!exam ? [
            { label: 'Examination', required: true },
            { label: 'Course', initial: data.defaultCourse, required: true },
            { label: 'Duration (minutes)', type: 'number', min: 1, initial: data.duration, required: true },
        ] : []),
        { label: 'Access window opens', type: 'datetime-local', initial: exam?.window.opens ?? data.opens, required: true },
        { label: 'Access window closes', type: 'datetime-local', initial: exam?.window.closes ?? data.closes, required: true },
        { label: 'Attempt limit', options: ['1 attempt', '2 attempts'] },
        { label: 'Auto-submit on expiry', options: ['Always', 'Prompt only'] },
        { label: 'Random draw', options: ['Per candidate', 'Fixed paper'] },
        { label: 'Shuffle options', options: ['Yes', 'No'] },
    ];
    const [values, setValues] = useState<Values>(() => ({
        ...Object.fromEntries(fields.map(field => [field.label, field.initial ?? field.options?.[0] ?? ''])),
        ...exam?.config,
    }));
    const error = windowError({ opens: values['Access window opens'], closes: values['Access window closes'] });

    function submit(event: FormEvent) {
        event.preventDefault();
        if (error) {
            return;
        }

        const {
            Examination,
            Course,
            'Duration (minutes)': minutes,
            'Access window opens': opens,
            'Access window closes': closes,
            ...config
        } = values;
        save({
            title: exam?.title ?? Examination,
            course: exam?.course ?? Course,
            duration: exam?.duration ?? `${minutes} min`,
            date: exam?.date ?? opens.replace('T', ' '),
            window: { opens, closes },
            config,
        });
    }

    return (
        <Card title="Sitting configuration">
            <form id="sitting-configuration" onSubmit={submit}>
                <Fields fields={fields} values={values} change={setValues} />
                {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            </form>
        </Card>
    );
}
