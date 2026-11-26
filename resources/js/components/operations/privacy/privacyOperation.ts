import type { ComponentType } from 'react';

export type OperationChoice = {
    value: string;
    label: string;
};

export type OperationFields = {
    errors: Record<string, string>;
    operations: OperationChoice[];
};

export type Receipt = {
    message: string;
    details?: string;
};

export type PrivacyOperation = {
    heading: string;
    description: string;
    action: string;
    variant: 'outline' | 'destructive';
    Fields: ComponentType<OperationFields>;
    target: (fields: FormData) => string | null;
    receipt: (data: Record<string, unknown>, fields: FormData) => Receipt;
    notFound?: Record<string, string>;
};

export function takeIdentifier(fields: FormData, name: string) {
    const value = String(fields.get(name));
    fields.delete(name);
    return encodeURIComponent(value);
}
