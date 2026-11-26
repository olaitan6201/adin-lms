import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Exam, SittingDraft, BlueprintData } from '@/types/assessments/cbt';
import { Drawer } from './Controls';
import { type Values, Editor } from './Editor';

export function Blueprint({
    exam,
    close,
    save,
    data,
}: {
    data: BlueprintData;
    exam?: Exam;
    close: () => void;
    save: (draft: SittingDraft) => void;
}) {
    function submit(values: Values) {
        const { Examination, Course, 'Duration (minutes)': minutes, 'Access window opens': opens,
            'Access window closes': closes, ...config } = values;
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
        <Drawer
            title={exam ? `${exam.title.replace(/ examination$/, '')} blueprint` : 'Schedule examination'}
            subtitle={exam && `${exam.date} · ${exam.duration.replace(' min', ' minutes')} · ${exam.candidates} candidates`}
            close={close}
        >
            <Card title="Blueprint" subtitle={`Total ${data.examBlueprint.reduce((sum, s) => sum + s.marks, 0)} marks`}>
                <Table
                    columns={['Section', 'Items', 'Marks', 'Types']}
                    rows={data.examBlueprint.map((s) => [s.section, s.items, s.marks, s.type])}
                />
            </Card>
            <Card title="Sitting configuration">
                <Editor
                    formId="sitting-configuration"
                    externalSubmit
                    fields={[
                        ...(!exam
                            ? [
                                  { label: 'Examination', required: true },
                                  { label: 'Course', initial: data.defaultCourse, required: true },
                                  { label: 'Duration (minutes)', type: 'number', min: 1, initial: data.duration, required: true },
                              ]
                            : []),
                        { label: 'Access window opens', type: 'datetime-local', initial: exam ? exam.window.opens : data.opens, required: true },
                        { label: 'Access window closes', type: 'datetime-local', initial: exam ? exam.window.closes : data.closes, required: true },
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
            <Card
                title="Attempt papers"
                subtitle="The paper drawn for each attempt, kept as issued so a candidate can be shown exactly what they sat"
            >
                <p className="flex justify-between gap-2 text-sm font-medium">
                    Attempt 1 · drawn per candidate <Badge tone="sky">Seeded draw</Badge>
                </p>
                <p className="my-2 text-xs leading-relaxed text-ink-500">
                    Each candidate receives a different question order and option order from the same blueprint. The drawn paper is
                    preserved with the attempt and cannot be regenerated afterwards.
                </p>
                <Table columns={['Candidate', 'Paper', 'Started', 'State']} rows={data.papersByExam[exam?.id ?? ''] ?? []} />
                <div className="mt-3 rounded-xl border border-ink-100 p-3.5">
                    <strong>Re-issue rule</strong> <Badge tone="amber">Second attempt</Badge>
                    <p className="mt-1 text-xs">
                        A candidate who is re-scheduled sits a new attempt drawn from the same blueprint. The first paper is retained
                        and shown to the reviewer alongside the second.
                    </p>
                </div>
            </Card>
            <Card title="Accommodations">
                <div className="flex items-center justify-between rounded-lg bg-ink-50 p-3">
                    <div>
                        <p>{data.accommodations[exam?.id ?? ''] ?? 0} candidates approved</p>
                        <p className="text-xs text-ink-500">
                            Additional time or separate invigilation, recorded against the candidate
                        </p>
                    </div>
                    <Badge tone="sky">{data.accommodations[exam?.id ?? ''] ?? 0}</Badge>
                </div>
            </Card>
            <div className="flex justify-end gap-2">
                <Action onClick={close}>Close</Action>
                <button className="btn btn-primary" form="sitting-configuration">
                    Save
                </button>
            </div>
        </Drawer>
    );
}
