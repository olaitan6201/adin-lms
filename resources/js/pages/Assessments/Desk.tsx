import { AssessmentItemPanel, type Item } from '../../assessment/AssessmentItemPanel';
import '../../assessment/assessment.css';
import { Head, Link } from '@inertiajs/react';
import { SetupBook, type PolicyDefinition } from '../../assessment/SetupBook';
import { Post, type Member } from '../../assessment/Fields';
import { ResultRevisions, type Grade } from '../../assessment/ResultRevisions';

type Props = {
    offering: string;
    book: string | null;
    policy:
        | (Omit<PolicyDefinition, 'items'> & {
              id: string;
              version: number;
          })
        | null;
    items: Item[];
    grades: Grade[];
    teacher: boolean;
    officer: boolean;
    learner: boolean;
    roster: Member[];
};
export default function Desk({ offering, book, policy, items, grades, teacher, officer, learner, roster }: Props) {
    const who = (id: string) => roster.find((m) => m.id === id)?.name;

    return (
        <main className="portal-page assessment-page">
            <Head title="Assessments" />
            <header className="assessment-heading">
                <p className="portal-kicker">
                    {teacher ? 'Teaching workspace' : officer ? 'Examinations office' : 'Course assessment'}
                </p>
                <h1 className="portal-title">Assessments and results</h1>
                <p>
                    {teacher
                        ? 'Prepare assessments, review submissions and calculate results.'
                        : officer
                          ? 'Configure policy and review the marks supporting each result.'
                          : 'Open your assignments and exams, then follow returned marks and published results.'}
                </p>
                <nav aria-label="Assessment sections">
                    {teacher && <Link href={`/community/courses/${offering}#study-groups`}>Manage study groups</Link>}
                    {teacher && <Link href={`/courses/${offering}/question-banks`}>Question banks</Link>}
                    <a href="#result-revisions">Result history</a>
                </nav>
            </header>
            {!book &&
                (teacher || officer ? (
                    <SetupBook url={`/courses/${offering}/assessments`} />
                ) : (
                    <p>No assessments configured.</p>
                ))}
            {officer && policy && (
                <details>
                    <summary>Amend grading policy · version {policy.version}</summary>
                    <SetupBook
                        key={policy.id}
                        url={`/courses/${offering}/assessments`}
                        policy={{
                            ...policy,
                            items: items.map((i) => ({
                                id: i.id,
                                title: i.title,
                                kind: i.kind,
                                weight: String(i.weight_percent),
                                maximum: String(i.maximum_score),
                                rubric: i.rubric?.guide ?? '',
                                criteria: i.rubric?.criteria ?? [],
                            })),
                        }}
                    />
                </details>
            )}
            {items.map((i) => (
                <AssessmentItemPanel
                    key={i.id}
                    item={i}
                    teacher={teacher}
                    learner={learner}
                    officer={officer}
                    roster={roster}
                    who={who}
                />
            ))}
            {book && teacher && (
                <details>
                    <summary>Compute results</summary>
                    {roster.map((m) => (
                        <Post key={m.id} url={`/gradebooks/${book}/compute/${m.id}`} button={`Compute ${m.name}`} />
                    ))}
                </details>
            )}
            <ResultRevisions grades={grades} teacher={teacher} officer={officer} who={who} />
        </main>
    );
}
