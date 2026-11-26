import { FormFeedback } from '@/components/forms/FormFeedback';
import { selectionTotal } from './selectionPoints';
import { ExamWindowControls } from '@/components/assessments/exams/ExamWindowControls';
import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { SubmitButton } from '@/components/forms/PortalForm';
import type { BankQuestion } from '@/components/assessments/contracts';
import { FixedQuestionSelections } from './FixedQuestionSelections';
import { RandomTopicSlots } from './RandomTopicSlots';

type Props = {
    item: string;
    maximum: string;
    questions: BankQuestion[];
    topics: {
        id: string;
        topic: string;
    }[];
};

export function QuestionPicker({ item, maximum, questions, topics }: Props) {
    const [points, setPoints] = useState<Record<string, string>>({});
    const [draws, setDraws] = useState<string[]>([]);
    const total = selectionTotal([...Object.values(points), ...draws]);

    return (
        <Form
            action={`/assessment-items/${item}/exam`}
            method="post"
            className="grid min-w-0 gap-4 rounded-lg border p-4 sm:p-5 [&_button[type=submit]]:h-auto [&_button[type=submit]]:min-h-9 [&_button[type=submit]]:whitespace-normal"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    <ExamWindowControls errors={errors} />
                    <FixedQuestionSelections questions={questions} points={points} setPoints={setPoints} />
                    <RandomTopicSlots topics={topics} draws={draws} setDraws={setDraws} />
                    <p role="status" aria-atomic="true">
                        {total === null
                            ? 'Enter points greater than zero and at most 1000000, with up to 8 decimal places.'
                            : `Selected total: ${total} / ${maximum} points`}
                    </p>
                    <SubmitButton processing={processing || total === null}>
                        Create examination from selection
                    </SubmitButton>
                    {recentlySuccessful && <p role="status">Saved.</p>}
                </FormFeedback>
            )}
        </Form>
    );
}
