export function AssignmentDownload({
    url,
    id,
    children,
}: {
    url: string;
    id: string;
    children: React.ReactNode;
}) {
    return (
        <a className="block w-fit text-primary underline underline-offset-4" href={`${url}/files/${id}`}>
            {children}
        </a>
    );
}
