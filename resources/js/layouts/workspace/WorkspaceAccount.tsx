import { Link } from '@inertiajs/react';
import { useWorkspaceShell } from './shellModel';

export function WorkspaceAccount() {
    const { live } = useWorkspaceShell();
    const account = live?.account;
    if (!account) {
        return null;
    }

    const initials = account.name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map(part => part[0])
        .join('');
    const content = (
        <>
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-800">
                {initials}
            </span>
            <span className="hidden min-w-0 text-left leading-tight lg:block">
                <strong className="block truncate text-[12.5px] font-medium text-ink-800">{account.name}</strong>
                <small className="block truncate text-[11px] text-ink-600">{account.role}</small>
            </span>
        </>
    );
    const className = 'ml-1 flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1';

    return live.profile ? (
        <Link href={live.profile} className={`${className} hover:bg-ink-100`} aria-label={`Profile: ${account.name}`}>
            {content}
        </Link>
    ) : (
        <span className={className}>{content}</span>
    );
}
