import { CourseDisclosure } from '@/components/CourseDisclosure';
import { AssessmentItemPanel, type Item } from '../../assessment/AssessmentItemPanel';
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
        <main className="mx-auto w-full min-w-0 max-w-4xl space-y-6 px-4 py-6 wrap-anywhere sm:px-6 lg:py-10">
            <Head title="Assessments" />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">
                    {teacher ? 'Teaching workspace' : officer ? 'Examinations office' : 'Course assessment'}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">Assessments and results</h1>
                <p>
                    {teacher
                        ? 'Prepare assessments, review submissions and calculate results.'
                        : officer
                          ? 'Configure policy and review the marks supporting each result.'
                          : 'Open your assignments and exams, then follow returned marks and published results.'}
                </p>
                <nav aria-label="Assessment sections" className="flex flex-wrap gap-x-5 gap-y-2">
                    {teacher && <Link className="text-primary underline underline-offset-4" href={`/community/courses/${offering}#study-groups`}>Manage study groups</Link>}
                    {teacher && <Link className="text-primary underline underline-offset-4" href={`/courses/${offering}/question-banks`}>Question banks</Link>}
                    <a className="text-primary underline underline-offset-4" href="#result-revisions">Result history</a>
                </nav>
            </header>
            {!book &&
                (teacher || officer ? (
                    <SetupBook url={`/courses/${offering}/assessments`} />
                ) : (
                    <p>No assessments configured.</p>
                ))}
            {officer && policy && (
                <CourseDisclosure label={`Amend grading policy · version ${policy.version}`}>
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
                </CourseDisclosure>
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
                <CourseDisclosure label="Compute results">
                    {roster.map((m) => (
                        <Post key={m.id} url={`/gradebooks/${book}/compute/${m.id}`} button={`Compute ${m.name}`} />
                    ))}
                </CourseDisclosure>
            )}
            <ResultRevisions grades={grades} teacher={teacher} officer={officer} who={who} />
        </main>
    );
}
