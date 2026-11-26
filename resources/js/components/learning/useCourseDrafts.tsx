import { useState } from 'react';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { CourseDraftForm, type CourseDraft, type DraftKind } from './CourseDraftForm';

type Entry = CourseDraft & {
    id: string;
    kind: DraftKind;
};

export function useCourseDrafts() {
    const [drafts, setDrafts] = useState<Entry[]>([]);
    const { openDrawer, close } = useWorkspaceOverlays();

    function edit(kind: DraftKind, initial?: CourseDraft, id: string = crypto.randomUUID()) {
        function save(draft: CourseDraft) {
            setDrafts((items) => [...items.filter((item) => item.id !== id), { ...draft, id, kind }]);
            close();
        }

        openDrawer({
            title: `${kind} draft`,
            content: <CourseDraftForm kind={kind} initial={drafts.find((item) => item.id === id) ?? initial} save={save} />,
        });
    }

    return { drafts, edit };
}
