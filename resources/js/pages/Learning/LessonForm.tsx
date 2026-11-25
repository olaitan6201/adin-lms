import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { EntryForm } from './EntryForm';
import { useState } from 'react';
import { AvailabilityFields } from './AvailabilityFields';
import type { Choice, Lesson } from './contracts';
import { ManuscriptEditor } from './ManuscriptEditor';

export function LessonForm({
    base,
    lesson,
    position,
    lessons,
    lessonKinds,
    quizzes,
    startOverview = false,
}: {
    base: string;
    lesson?: Lesson;
    position: number;
    lessons: Lesson[];
    lessonKinds: string[];
    quizzes: Choice[];
    startOverview?: boolean;
}) {
    const [order, setOrder] = useState(position);
    return (
        <details open={startOverview || undefined}>
            <summary>{lesson ? 'Edit lesson or publish' : 'Author a lesson'}</summary>
            <EntryForm
                originalTimes={lesson}
                action={`${base}/lessons${lesson ? `/${lesson.id}` : ''}`}
                label="Save lesson"
            >
                <Label className="grid gap-2">
                    Title
                    <Input name="title" required maxLength={191} defaultValue={lesson?.title} />
                </Label>
                <Label className="grid gap-2">
                    Order
                    <Input
                        type="number"
                        min="1"
                        name="position"
                        required
                        defaultValue={position}
                        onChange={(event) => setOrder(event.currentTarget.valueAsNumber)}
                    />
                </Label>
                <Label className="grid gap-2">
                    Require completion of
                    <NativeSelect name="prerequisite_id" defaultValue={lesson?.prerequisite_id ?? ''}>
                        <NativeSelectOption value="">No prior lesson</NativeSelectOption>
                        {lessons
                            .filter((prior) => prior.id !== lesson?.id && prior.position < order)
                            .map((prior) => (
                                <NativeSelectOption key={prior.id} value={prior.id}>
                                    {prior.position}. {prior.title}
                                </NativeSelectOption>
                            ))}
                    </NativeSelect>
                </Label>
                <Label className="grid gap-2">
                    Organisation
                    <NativeSelect name="kind" defaultValue={lesson?.kind ?? (startOverview ? 'overview' : undefined)}>
                        {lessonKinds.map((k) => (
                            <NativeSelectOption key={k}>{k}</NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
                <ManuscriptEditor lesson={lesson} quizzes={quizzes} />
                <Label className="grid gap-2">
                    Publication
                    <NativeSelect name="published" defaultValue={lesson?.published ? '1' : '0'}>
                        <NativeSelectOption value="0">Draft</NativeSelectOption>
                        <NativeSelectOption value="1">Publish</NativeSelectOption>
                    </NativeSelect>
                </Label>
                <AvailabilityFields item={lesson} />
            </EntryForm>
        </details>
    );
}
