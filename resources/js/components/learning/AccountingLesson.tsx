import type { Chapter } from '@/types/learning/lesson';
import { PostingFlow } from '@/components/icons/PostingFlow';

export function AccountingLesson({ chapter }: { chapter: Chapter }) {
    return (
        <>
            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Learning objectives</h3>
                <ul className="mt-2 space-y-1.5">
                    {chapter.objectives.map((objective) => (
                        <li key={objective} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                            {objective}
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">{chapter.heading}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.75] text-ink-600">{chapter.explanation}</p>
                <div className="mt-4 overflow-hidden rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                    <PostingFlow steps={[
                        { title: 'Transaction', detail: chapter.transaction },
                        { title: 'Journal', detail: chapter.posting },
                        { title: 'Ledger', detail: 'Running balances' },
                    ]} result="Trial balance" />
                </div>
            </section>

            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Worked example</h3>
                <div className="mt-2 rounded-xl border border-ink-100 p-4">
                    <p className="text-[13.5px] leading-[1.75] text-ink-600">{chapter.example}</p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-ink-100">
                        <table className="w-full text-[13px]">
                            <thead className="bg-ink-50 text-left text-[11px] uppercase tracking-wider text-ink-400">
                                <tr>
                                    <th className="px-3 py-2 font-semibold">Account</th>
                                    <th className="px-3 py-2 font-semibold">Debit</th>
                                    <th className="px-3 py-2 font-semibold">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink-100">
                                <tr>
                                    <td className="px-3 py-2 text-ink-700">{chapter.debitAccount}</td>
                                    <td className="px-3 py-2 tnum">{chapter.amount}</td>
                                    <td className="px-3 py-2 tnum" />
                                </tr>
                                <tr>
                                    <td className="px-3 py-2 text-ink-700">{chapter.creditAccount}</td>
                                    <td className="px-3 py-2 tnum" />
                                    <td className="px-3 py-2 tnum">{chapter.amount}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-[13.5px] leading-[1.75] text-ink-600">{chapter.reason}</p>
                </div>
            </section>
        </>
    );
}
