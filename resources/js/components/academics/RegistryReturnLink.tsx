import { Link } from '@inertiajs/react';
import { focusAfterRegistryNavigation } from './registryFocus';

export function RegistryReturnLink({ href, label, rowId, listHeadingId }: {
    href: string;
    label: string;
    rowId: string;
    listHeadingId: string;
}) {
    return (
        <Link
            href={href}
            className="inline-flex min-h-11 items-center underline"
            onSuccess={() => focusAfterRegistryNavigation(rowId, listHeadingId)}
        >
            {label}
        </Link>
    );
}
