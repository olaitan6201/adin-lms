import { useState } from 'react';
import { canOpenBank, selectedBank } from './bankAccess';
import type { Bank, BankDraft, Question } from '@/types/assessments/cbt';

export function useBankCatalogue(
    questionBanks: Bank[],
    bankItems: Record<string, Question[]>,
    officer: boolean,
) {
    const [catalogue, setCatalogue] = useState({
        banks: questionBanks,
        items: bankItems,
    });
    const { banks, items } = catalogue;
    const questionTotal = banks.reduce((sum, row) => sum + row.questions, 0);
    const [bankId, setBankId] = useState('');
    const bank = selectedBank(banks, bankId, officer);

    function createBank(draft: BankDraft) {
        if (!canOpenBank(draft, officer)) {
            return;
        }

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
        }));
    }

    return { banks, items, questionTotal, bank, bankId, setBankId, createBank, addQuestion };
}
