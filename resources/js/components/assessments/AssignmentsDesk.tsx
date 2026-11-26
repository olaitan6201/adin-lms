import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { AssignmentList, MarkingQueue } from './AssignmentTables';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import type { Assignment, AssignmentDraft, Submission, MarkingGuide } from '@/types/assessments/assignments';
import { recordMark } from './assignmentRecords';
import { AssignmentEditor, MarkingPanel, feedbackChecks } from './AssignmentPanels';
import { Checks } from './Editor';
import { Fields, Note, Sections, exportSheet, type FieldSpec, type Values } from './Controls';

export default function AssignmentsDesk({
    lecturer = false,
    assignments,
    submissions,
    awaiting,
    guide,
    opens,
    enrolment,
    timing,
    ruleFields,
}: {
    timing: FieldSpec[];
    ruleFields: FieldSpec[];
    lecturer?: boolean;
    assignments: Assignment[];
    submissions: Submission[];
    awaiting: number;
    guide: MarkingGuide;
    opens: string;
    enrolment: number;
}) {
    const [tab, setTab] = useState(0);
    const [records, setRecords] = useState({ rows: assignments, queue: submissions, awaiting });
    const { rows, queue } = records;
    const [edit, setEdit] = useState<Assignment | 'new'>();
    const [mark, setMark] = useState<Submission>();
    const [rules, setRules] = useState<Values>({});
    const [checks, setChecks] = useState(feedbackChecks.slice(0, 3));
    const [filter, setFilter] = useState('');
    const filteredQueue = filter ? queue.filter((script) => script.assignmentId === filter) : queue;
    const filterTitle = rows.find((row) => row.id === filter)?.title;

    function openMarking(assignment: Assignment) {
        const candidate = queue.find((script) => script.assignmentId === assignment.id);
        if (candidate) {
            setMark(candidate);
        } else {
            setFilter(assignment.id);
            setTab(1);
        }
    }

    function changeTab(index: number) {
        setFilter('');
        setTab(index);
    }

    function saveAssignment(draft: AssignmentDraft) {
        if (!edit) return;
        const base =
            edit === 'new'
                ? { id: crypto.randomUUID(), marked: 0, total: enrolment, submissions: 0, late: 0, state: 'scheduled' }
                : edit;
        const updated = { ...base, ...draft };
        setRecords((current) => ({
            ...current,
            rows: edit === 'new' ? [...current.rows, updated] : current.rows.map((row) => (row.id === updated.id ? updated : row)),
        }));
        setEdit(undefined);
    }

    function saveMark(updated: Submission) {
        setRecords((current) => recordMark(current, updated));
        setMark(undefined);
    }
    const report = () =>
        exportSheet(
            'marking-report',
            ['Assignment', 'Course', 'Submissions', 'Marked'],
            rows.map((r) => [r.title, r.course, r.submissions, r.marked]),
        );
    const create = (
        <Action variant="primary" icon="plus" onClick={() => setEdit('new')}>
            New assignment
        </Action>
    );
    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow="Assessment"
                title={lecturer ? 'Assignments and marking' : 'Assignments'}
                description={
                    lecturer
                        ? 'Set instructions and rules, track what has arrived, and return marked work with written feedback.'
                        : 'Institution-wide view of assignment design, submission volume and marking throughput.'
                }
                actions={
                    <>
                        <Action icon="chart" onClick={report}>
                            Marking report
                        </Action>
                        {create}
                    </>
                }
            />
            <Sections
                labels={['Assignments', `${lecturer ? 'Marking' : 'Submission'} queue`, 'Rules and feedback']}
                counts={[rows.length, records.awaiting]}
                active={tab}
                change={changeTab}
            />
            {tab === 0 && <AssignmentList rows={rows} edit={setEdit} openMarking={openMarking} />}
            {tab === 1 && <MarkingQueue rows={filteredQueue} filterTitle={filterTitle} open={setMark} />}
            {tab === 2 && (
                <div className="grid gap-5 lg:grid-cols-2">
                    <Card title="Submission rules" subtitle="Applied per assignment unless the lecturer overrides them">
                        <Fields fields={ruleFields} values={rules} change={setRules} />
                    </Card>
                    <Card title="Feedback and return" subtitle="How marked work reaches the student">
                        <Checks labels={feedbackChecks} selected={checks} change={setChecks} />
                    </Card>
                </div>
            )}
            <Note>A submission receipt is issued on upload and every score change is retained with the reason and the author.</Note>
            {edit && (
                <AssignmentEditor
                    timing={timing}
                    opens={opens}
                    course={assignments[0]?.course}
                    key={edit === 'new' ? edit : edit.id}
                    row={edit === 'new' ? undefined : edit}
                    rules={rules}
                    close={() => setEdit(undefined)}
                    save={saveAssignment}
                />
            )}
            {mark && (
                <MarkingPanel
                    guide={guide}
                    key={mark.id}
                    row={mark}
                    assignmentTitle={rows.find((row) => row.id === mark.assignmentId)?.title}
                    close={() => setMark(undefined)}
                    save={saveMark}
                />
            )}
        </div>
    );
}
