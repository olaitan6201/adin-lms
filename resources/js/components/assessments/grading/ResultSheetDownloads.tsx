export function ResultSheetDownloads({ href }: { href: string }) {
    return (
        <div>
            <a className="text-primary underline underline-offset-4" href={`${href}?format=pdf`}>
                Download result sheet (PDF)
            </a>
            {' · '}
            <a className="text-primary underline underline-offset-4" href={href}>
                Download result data (JSON)
            </a>
        </div>
    );
}
