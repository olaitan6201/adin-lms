import { CaseReference } from './PrivacyIdentifiers';
import type { PrivacyOperation } from './privacyOperation';

export const referIncident: PrivacyOperation = {
    heading: 'Record an incident referral',
    description: 'Contact the privacy lead first. Logging the reference does not send an alert.',
    action: 'Record referral',
    variant: 'outline',
    Fields: ({ errors }) => (
        <CaseReference
            label="Incident reference"
            error={errors.reference}
        />
    ),
    target: () => 'incidents',
    receipt: (data) => ({ message: `Referral receipt: ${data.audit}` }),
};
