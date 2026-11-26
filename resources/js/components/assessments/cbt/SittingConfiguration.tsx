import { Card } from '@/components/ui/layout/Card';
import type { Exam, SittingDraft, BlueprintData } from '@/types/assessments/cbt';
import { type Values, Editor } from '../Editor';

export function SittingConfiguration({
    exam,
    data,
    save,
}: {
    exam?: Exam;
    data: BlueprintData;
    save: (draft: SittingDraft) => void;
}) {
    function submit(values: Values) {
        const {
            Examination,
            Course,
            'Duration (minutes)': minutes,
            'Access window opens': opens,
            'Access window closes': closes,
            ...config
        } = values;
        save({
            title: Examination,
            course: Course,
            duration: `${minutes} min`,
            date: exam?.date ?? opens.replace('T', ' '),
            window: { opens, closes },
            config,
        });
    }

    return (
        <Card title="Sitting configuration">
            <Editor
                formId="sitting-configuration"
                externalSubmit
                fields={[
                    ...(!exam
                        ? [
                              { label: 'Examination', required: true },
                              { label: 'Course', initial: data.defaultCourse, required: true },
                              {
                                  label: 'Duration (minutes)',
                                  type: 'number',
                                  min: 1,
                                  initial: data.duration,
                                  required: true,
                              },
                          ]
                        : []),
                    {
                        label: 'Access window opens',
                        type: 'datetime-local',
                        initial: exam ? exam.window.opens : data.opens,
                        required: true,
                    },
                    {
                        label: 'Access window closes',
                        type: 'datetime-local',
                        initial: exam ? exam.window.closes : data.closes,
                        required: true,
                    },
                    { label: 'Attempt limit', options: ['1 attempt', '2 attempts'] },
                    { label: 'Auto-submit on expiry', options: ['Always', 'Prompt only'] },
                    { label: 'Random draw', options: ['Per candidate', 'Fixed paper'] },
                    { label: 'Shuffle options', options: ['Yes', 'No'] },
                ]}
                initial={
                    exam
                        ? {
                              Examination: exam.title,
                              Course: exam.course,
                              'Duration (minutes)': exam.duration.split(' ')[0],
                              ...exam.config,
                          }
                        : undefined
                }
                save={submit}
            />
        </Card>
    );
}
