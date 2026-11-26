import { NativeSelectOption } from '@/components/ui/native-select';
import { OperationsSelect } from '../OperationsFields';
import { CaseReference, Identifier } from './PrivacyIdentifiers';
import { takeIdentifier, type PrivacyOperation } from './privacyOperation';

export const approveCase: PrivacyOperation = {
    heading: 'Approve a case action',
    description: 'Verify the case, subject and scope. This records a receipt; it does not run the action.',
    action: 'Create approval receipt',
    variant: 'outline',
    Fields: ({ errors, operations }) => (
        <>
            <Identifier
                name="subject"
                label="Subject account UUID"
                error={errors.subject}
            />
            <CaseReference
                label="Case reference"
                error={errors.reference}
            />
            <OperationsSelect
                name="operation"
                label="Approved scope"
                error={errors.operation}
            >
                {operations.map((item) => (
                    <NativeSelectOption
                        key={item.value}
                        value={item.value}
                    >
                        {item.label}
                    </NativeSelectOption>
                ))}
            </OperationsSelect>
        </>
    ),
    target: (fields) => `${takeIdentifier(fields, 'subject')}/approvals`,
    receipt: (data, fields) => ({
        message: `Approval receipt for ${fields.get('reference')}: ${data.approval}`,
    }),
    notFound: { subject: 'Check the subject account UUID in the restricted case system.' },
};
