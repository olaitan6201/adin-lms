export function ResultSheetDownloads({ href }: { href: string }) {
    return (
        <div>
            <a className="desk-link" href={`${href}?format=pdf`}>Download result sheet (PDF)</a>
            {' · '}
            <a className="desk-link" href={href}>Download result data (JSON)</a>
        </div>
    );
}
