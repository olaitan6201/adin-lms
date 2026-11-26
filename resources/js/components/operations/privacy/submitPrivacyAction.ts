export type PrivacyMode = 'approve' | 'execute' | 'refer';
type Outcome = { result: string } | { errors: Record<string, string> };

export async function submitPrivacyAction(mode: PrivacyMode, csrf: string, fields: FormData): Promise<Outcome> {
    const subject = encodeURIComponent(String(fields.get('subject')));
    const approval = encodeURIComponent(String(fields.get('approval')));
    const path = mode === 'refer' ? 'incidents' : mode === 'approve' ? `${subject}/approvals` : `${subject}/execute/${approval}`;
    fields.delete('subject');
    fields.delete('approval');

    const response = await fetch(`/operations/privacy/${path}`, {
        method: 'POST',
        body: fields,
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf },
    });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (mode === 'refer') return { result: `Referral receipt: ${data.audit}` };
        if (mode === 'approve') return { result: `Approval receipt for ${fields.get('reference')}: ${data.approval}` };
        return { result: JSON.stringify(data, null, 2) };
    }
    if (response.status === 422) {
        const { errors }: { errors: Record<string, string[]> } = await response.json();
        return { errors: Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]])) };
    }
    if (response.status === 404 && mode !== 'refer') {
        return mode === 'approve'
            ? { errors: { subject: 'Check the subject account UUID in the restricted case system.' } }
            : { errors: { approval: 'Check the subject and approval UUIDs against the same approval receipt.' } };
    }
    const message = response.status === 409 ? (await response.json()).message : null;
    return { errors: { form: message ?? 'Action not confirmed. Check your access and the case record before trying again.' } };
}
