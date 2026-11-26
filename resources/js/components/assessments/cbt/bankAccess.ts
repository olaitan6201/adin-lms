import type { Bank } from '@/types/assessments/cbt';

export function canOpenBank(bank: Pick<Bank, 'security'>, officer: boolean) {
    return bank.security === 'open' || (officer && bank.security === 'restricted');
}

export function selectedBank(banks: Bank[], id: string, officer: boolean) {
    return banks.find(bank => bank.id === id && canOpenBank(bank, officer));
}
