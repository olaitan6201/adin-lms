import { useState, type ChangeEvent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CaseReference, Identifier } from './PrivacyIdentifiers';
import { takeIdentifier, type OperationFields, type PrivacyOperation } from './privacyOperation';

function ExecutionFields({ errors }: OperationFields) {
    const [caseReference, setCaseReference] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    function clearConfirmation() {
        setConfirmed(false);
    }

    function changeReference(event: ChangeEvent<HTMLInputElement>) {
        setCaseReference(event.target.value);
        clearConfirmation();
    }

    return (
        <>
            <Identifier
                name="subject"
                label="Subject account UUID"
                error={errors.subject}
                onChange={clearConfirmation}
            />
            <CaseReference
                label="Case reference on the approval receipt"
                error={errors.reference}
                onChange={changeReference}
            />
            <Identifier
                name="approval"
                label="Approval UUID"
                error={errors.approval}
                onChange={clearConfirmation}
            />
            <Label className="flex items-baseline gap-2 break-all">
                <Checkbox
                    name="confirmed"
                    value="yes"
                    required
                    checked={confirmed}
                    onCheckedChange={(value) => setConfirmed(value === true)}
                />
                I checked the subject, approval and scope against {caseReference || 'the case'} in the
                restricted system.
            </Label>
        </>
    );
}

export const executeApproval: PrivacyOperation = {
    heading: 'Execute an approval',
    description:
        'Match both identifiers to the case receipt. A different authorised officer must act within 24 hours. Execution releases the approved extract or permanently deletes eligible withdrawn consents.',
    action: 'Execute recorded action',
    variant: 'destructive',
    Fields: ExecutionFields,
    target: (fields) => {
        if (fields.get('confirmed') !== 'yes') {
            return null;
        }

        fields.delete('confirmed');
        const subject = takeIdentifier(fields, 'subject');
        const approval = takeIdentifier(fields, 'approval');
        return `${subject}/execute/${approval}`;
    },
    receipt: (data) => ({
        message: 'Approved action completed.',
        details: JSON.stringify(data, null, 2),
    }),
    notFound: { approval: 'Check the subject and approval UUIDs against the same approval receipt.' },
};
