import type { ChangeEventHandler } from 'react';
import { OperationsInput } from '../OperationsFields';

const uuid = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

type IdentifierProps = {
    name: string;
    label: string;
    error?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

export function Identifier(props: IdentifierProps) {
    return (
        <OperationsInput
            {...props}
            required
            pattern={uuid}
        />
    );
}

export function CaseReference(props: Omit<IdentifierProps, 'name'>) {
    return (
        <OperationsInput
            {...props}
            name="reference"
            maxLength={64}
            required
            pattern={'[A-Za-z0-9_\\-]{1,64}'}
        />
    );
}
