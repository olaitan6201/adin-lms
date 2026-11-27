// The reference keeps these panels mounted across section changes. Only their
// closed presentation belongs to the shell; form state stays with the page.
const drawerCounts: Readonly<Partial<Record<string, 1 | 2>>> = {
    'admin/structure': 1,
    'admin/people': 2,
    'admin/curriculum': 2,
    'admin/delivery': 1,
    'admin/content': 2,
    'admin/classroom': 1,
    'admin/assignments': 2,
    'admin/cbt': 2,
    'admin/attendance': 1,
    'admin/communication': 2,
    'lecturer/classroom': 1,
    'lecturer/assignments': 2,
    'lecturer/cbt': 2,
    'lecturer/attendance': 1,
    'lecturer/communication': 2,
    'student/assignments': 1,
    'student/communication': 2,
};

export function WorkspaceDrawerEdge({ screen }: { screen: string }) {
    const count = drawerCounts[screen];

    if (!count) {
        return null;
    }

    return (
        <>
            <span
                aria-hidden="true"
                inert
                className="ws-drawer-edge"
                data-panels={count}
                data-module={screen.split('/')[1]}
            />
            {count === 2 && <span aria-hidden="true" inert className="ws-drawer-edge ws-drawer-edge-secondary" />}
        </>
    );
}
