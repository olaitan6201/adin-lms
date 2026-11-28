import { Link } from '@inertiajs/react';
import { focusAfterRegistryNavigation } from './registryFocus';

export function RegistryPagination({ label, item, previous, next, headingId }: {
    label: string;
    item: string;
    previous: string | null;
    next: string | null;
    headingId: string;
}) {
    if (!previous && !next) {
        return null;
    }

    function focusHeading() {
        focusAfterRegistryNavigation(headingId);
    }

    return (
        <nav aria-label={label} className="flex flex-wrap gap-4">
            {previous && (
                <Link className="inline-flex min-h-11 items-center underline" href={previous} onSuccess={focusHeading}>
                    Previous {item}
                </Link>
            )}
            {next && (
                <Link className="inline-flex min-h-11 items-center underline" href={next} onSuccess={focusHeading}>
                    Next {item}
                </Link>
            )}
        </nav>
    );
}
