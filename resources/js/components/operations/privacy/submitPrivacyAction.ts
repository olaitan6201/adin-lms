import type { PrivacyOperation, Receipt } from './privacyOperation';

export type PrivacyMode = 'approve' | 'execute' | 'refer';
type Outcome = { result: Receipt } | { errors: Record<string, string> };

export async function submitPrivacyAction(operation: PrivacyOperation, csrf: string, fields: FormData): Promise<Outcome> {
    const path = operation.target(fields);
    if (path === null) {
        return { errors: { form: 'Confirm the identifiers against the approval receipt before submitting.' } };
    }

    const response = await fetch(`/operations/privacy/${path}`, {
        method: 'POST',
        body: fields,
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf },
    });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        return { result: operation.receipt(data, fields) };
    }

    if (response.status === 422) {
        const { errors }: { errors: Record<string, string[]> } = await response.json();
        return { errors: Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]])) };
    }

    if (response.status === 404 && operation.notFound) {
        return { errors: operation.notFound };
    }

    const message = response.status === 409 ? (await response.json()).message : null;
    return { errors: { form: message ?? 'Action not confirmed. Check your access and the case record before trying again.' } };
}
