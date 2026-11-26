import { useState } from 'react';
import type { Bank, BankDraft, Question } from '@/types/assessments/cbt';

export function useBankCatalogue(
    questionBanks: Bank[],
    bankItems: Record<string, Question[]>,
    total: number,
) {
    const [catalogue, setCatalogue] = useState({
        banks: questionBanks,
        items: bankItems,
        questionTotal: total,
    });
    const { banks, items, questionTotal } = catalogue;
    const [bankId, setBankId] = useState('');
    const bank = banks.find((b) => b.id === bankId);

    function createBank(draft: BankDraft) {
        const created = {
            ...draft,
            id: crypto.randomUUID(),
            questions: 0,
            updated: new Date().toLocaleDateString(),
        };
        setCatalogue((current) => ({ ...current, banks: [...current.banks, created] }));
        setBankId(created.id);
    }

    function addQuestion(question: Question) {
        if (!bank) {
            return;
        }
        const id = bank.id;
        setCatalogue((current) => ({
            items: { ...current.items, [id]: [...(current.items[id] ?? []), question] },
            banks: current.banks.map((row) =>
                row.id === id ? { ...row, questions: row.questions + 1 } : row,
            ),
            questionTotal: current.questionTotal + 1,
        }));
    }

    return { banks, items, questionTotal, bank, bankId, setBankId, createBank, addQuestion };
}
