import type { Practice } from '@/types/learning/lesson';
import { Action } from '@/components/ui/controls/Action';
import { SampleDownload } from './SampleDownload';
import type { StudyFile } from './deviceFiles';

export function LessonResources({ practice, materials, openPractice }: {
    practice: Practice;
    materials: readonly StudyFile[];
    openPractice: () => void;
}) {
    return (
        <div className="space-y-5">
            <section>
                <h3>Exercises and revision</h3>
                <Action onClick={openPractice}>{practice.exercise}</Action>
                <details>
                    <summary>Topic quiz · sample question</summary>
                    <p>Can equal debit and credit totals prove that every entry is correct?</p>
                    <details>
                        <summary>Check explanation</summary>
                        <p>Equal totals show that postings balance. An entry can still use the wrong account.</p>
                    </details>
                </details>
            </section>
            <section>
                <h3>Embedded external reading</h3>
                <p className="font-medium">{practice.readingTitle}</p>
                <p>Use IAS 2 to review how inventory costs are measured.</p>
                <a
                    className="btn btn-outline btn-sm"
                    href="https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open the live text (new tab)
                </a>
            </section>
            <section>
                <h3>Resources for this week</h3>
                <ul className="space-y-2">
                    {materials.map((item) => (
                        <li key={item.id}>
                            <SampleDownload file={item} label={`Download ${item.title}`} />
                        </li>
                    ))}
                    <li>Audio summary: the accounting cycle · no sample recording available</li>
                    <li>
                        <a
                            className="btn btn-outline btn-sm"
                            href="https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            IFRS 15 guidance: external reading (new tab)
                        </a>
                    </li>
                </ul>
            </section>
        </div>
    );
}
