import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { Sections } from './Sections';
import { Drawer } from './Drawer';
import { Note } from '@/components/ui/feedback/Note';
import { SecondMarkerForm } from './gradebook/SecondMarkerForm';
import { useGradebook, type MarkerDecision } from './gradebook/useGradebook';
import type { GradeRow, ScoreChange, GradePolicy, Metric } from '@/types/assessments/gradebook';
import { Moderation } from './gradebook/Moderation';
import { Weights } from './gradebook/Weights';
import { ScoreFilters } from './gradebook/ScoreFilters';
import { ScoreTable } from './gradebook/ScoreTable';
import { PublicationReview } from './gradebook/PublicationReview';
import { useScoreSheet } from './gradebook/useScoreSheet';

type Props = {
    lecturer?: boolean;
    gradeRows: GradeRow[];
    scoreHistory: ScoreChange[];
    policy: GradePolicy;
    metrics: readonly Metric[];
    course: string;
};

export default function GradebookDesk({
    lecturer = false,
    gradeRows,
    scoreHistory,
    policy,
    metrics,
    course,
}: Props) {
    const [tab, setTab] = useState(0);
    const { rows, history, adjustScore, secondMark, publishApproved } = useGradebook(
        { rows: gradeRows, history: scoreHistory },
        policy,
        lecturer,
    );
    const [weights, setWeights] = useState(policy.gradeWeights.map((w) => w.weight));
    const { visible, filters, download } = useScoreSheet(rows, metrics, course);
    const [dialog, setDialog] = useState('');
    function confirmPublication() {
        publishApproved();
        setDialog('');
    }

    function saveDecision(matric: string, decision: MarkerDecision, reason: string) {
        secondMark(matric, decision, reason);
        setDialog('');
    }

    function showStage(value: string) {
        filters.filter(value);
        filters.find('');
        setTab(0);
    }

    const release = () => setDialog('publish');
    const description = lecturer
        ? 'Enter scores, moderate them and submit them for approval before any result is released.'
        : 'Weights, scores, moderation and approval, with publication kept under an authorised officer.';
    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow="Results"
                title="Gradebook"
                description={description}
                actions={
                    <>
                        <Action icon="sheet" onClick={download}>
                            Result sheet
                        </Action>
                        <Action icon="check" variant="primary" onClick={release}>
                            Publish results
                        </Action>
                    </>
                }
            />
            <Sections
                labels={['Score sheet', 'Weights and rubric', 'Moderation and approval', 'History']}
                active={tab}
                change={setTab}
            />
            {tab === 0 && (
                <Card
                    className="grade-sheet"
                    title="Score sheet"
                    subtitle={`${course} · assignments and quizzes, participation, mid-term, practical and final`}
                    actions={
                        <>
                            <Action size="sm" icon="users" onClick={() => setDialog('marker')}>
                                Second marker
                            </Action>
                            <Action size="sm" icon="sheet" onClick={download}>
                                Download sheet
                            </Action>
                            <Action
                                size="sm"
                                icon="check"
                                variant="primary"
                                onClick={release}
                            >
                                Publish results
                            </Action>
                        </>
                    }
                >
                    <ScoreFilters {...filters} />
                    <p className="mb-3 text-sm">
                        The sheet shows recorded grades. Changing a score recalculates that row’s grade using
                        the boundaries under Weights and rubric.
                    </p>
                    <ScoreTable visible={visible} metrics={metrics} adjustScore={adjustScore} />
                </Card>
            )}
            {tab === 1 && <Weights policy={policy} saved={weights} save={setWeights} />}
            {tab === 2 && <Moderation rows={rows} filter={showStage} />}
            {tab === 3 && (
                <Card
                    title="Score and result history"
                    subtitle="Every change keeps the previous value, the reason and the author"
                >
                    <Table
                        columns={['When', 'Who', 'Change', 'Reason']}
                        rows={history.map((h) => [h.when, h.who, h.change, h.reason])}
                    />
                </Card>
            )}
            <Note amber>
                Published results are immutable in place. Any correction is applied as an approved version
                with its own reason and audit trail.
            </Note>
            {dialog === 'publish' && (
                <PublicationReview
                    rows={rows}
                    policy={policy}
                    lecturer={lecturer}
                    close={() => setDialog('')}
                    confirmPublication={confirmPublication}
                />
            )}
            {dialog === 'marker' && (
                <Drawer title="Second marker" close={() => setDialog('')}>
                    <SecondMarkerForm rows={rows} lecturer={lecturer} save={saveDecision} />
                </Drawer>
            )}
        </div>
    );
}
