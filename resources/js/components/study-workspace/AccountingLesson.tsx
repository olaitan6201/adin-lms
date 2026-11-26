export function AccountingLesson() {
    return (
        <>
            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Learning objectives</h3>
                <ul className="mt-2 space-y-1.5">
                    {[
                        'Record transactions in a book of original entry.',
                        'Post entries from subsidiary books to the general ledger.',
                        'Explain why a trial balance agrees without proving correctness.',
                    ].map((objective) => (
                        <li key={objective} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                            {objective}
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">From transaction to trial balance</h3>
                <p className="mt-2 text-[13.5px] leading-[1.75] text-ink-600">
                    A journal is a chronological record of transactions. Each entry names the accounts that change and the amount and direction
                    of the change. The ledger holds the running balance of each account, and the trial balance is a snapshot of those balances at
                    a point in time.
                </p>
                <div className="mt-4 overflow-hidden rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                    <svg
                        viewBox="0 0 520 150"
                        className="h-auto w-full"
                        role="img"
                        aria-label="Flow from transaction to journal, ledger and trial balance"
                    >
                        <rect x="6" y="45" width="104" height="60" rx="10" fill="#ffffff" stroke="#D5DDE6" />
                        <text x="58" y="72" textAnchor="middle" fontSize="12" fontWeight="600" fill="#22344C" fontFamily="Outfit, sans-serif">
                            Transaction
                        </text>
                        <text x="58" y="90" textAnchor="middle" fontSize="10" fill="#7A8CA0" fontFamily="Outfit, sans-serif">
                            Cash sale 50,000
                        </text>
                        <path d="M116 75h44" stroke="#AEBCCB" strokeWidth="1.6" />
                        <path d="m160 75-7-4v8z" fill="#AEBCCB" />
                        <rect x="166" y="45" width="104" height="60" rx="10" fill="#ffffff" stroke="#D5DDE6" />
                        <text x="218" y="70" textAnchor="middle" fontSize="12" fontWeight="600" fill="#22344C" fontFamily="Outfit, sans-serif">
                            Journal
                        </text>
                        <text x="218" y="88" textAnchor="middle" fontSize="10" fill="#7A8CA0" fontFamily="Outfit, sans-serif">
                            Dr Cash / Cr Sales
                        </text>
                        <path d="M276 75h44" stroke="#AEBCCB" strokeWidth="1.6" />
                        <path d="m320 75-7-4v8z" fill="#AEBCCB" />
                        <rect x="326" y="45" width="104" height="60" rx="10" fill="#ffffff" stroke="#D5DDE6" />
                        <text x="378" y="70" textAnchor="middle" fontSize="12" fontWeight="600" fill="#22344C" fontFamily="Outfit, sans-serif">
                            Ledger
                        </text>
                        <text x="378" y="88" textAnchor="middle" fontSize="10" fill="#7A8CA0" fontFamily="Outfit, sans-serif">
                            Running balances
                        </text>
                        <path d="M436 75h44" stroke="#AEBCCB" strokeWidth="1.6" />
                        <path d="m480 75-7-4v8z" fill="#AEBCCB" />
                        <rect x="420" y="115" width="94" height="30" rx="8" fill="#ECFDF5" stroke="#A7F3D0" />
                        <text x="467" y="134" textAnchor="middle" fontSize="11" fontWeight="600" fill="#047857" fontFamily="Outfit, sans-serif">
                            Trial balance
                        </text>
                        <path d="M378 105v10h42" stroke="#A7F3D0" strokeWidth="1.6" fill="none" />
                    </svg>
                </div>
            </section>

            <section>
                <h3 className="text-[14px] font-semibold text-ink-900">Worked example</h3>
                <div className="mt-2 rounded-xl border border-ink-100 p-4">
                    <p className="text-[13.5px] leading-[1.75] text-ink-600">
                        On 3 November a business bought 200 units of inventory for 300,000 cash. The entry is:
                    </p>
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
                                    <td className="px-3 py-2 text-ink-700">Inventory</td>
                                    <td className="px-3 py-2 tnum">300,000</td>
                                    <td className="px-3 py-2 tnum" />
                                </tr>
                                <tr>
                                    <td className="px-3 py-2 text-ink-700">Cash at bank</td>
                                    <td className="px-3 py-2 tnum" />
                                    <td className="px-3 py-2 tnum">300,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-[13.5px] leading-[1.75] text-ink-600">
                        An asset increases, so it is debited. Cash is also an asset, but it decreases here, so it is credited. The rule is about
                        the direction of the change, not about the account type alone.
                    </p>
                </div>
            </section>
        </>
    );
}
