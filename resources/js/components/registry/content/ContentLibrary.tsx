import { useUploadPolicy } from './useUploadPolicy';
import { useState } from 'react';
import { useDesk, Register, exportRecords } from '@/components/registry/Desk';
import { Note } from '@/components/ui/feedback/Note';
import { Action } from '@/components/ui/controls/Action';
import { ContentPolicy, Checklist } from '@/components/registry/ContentPolicy';
import { ResourceRegister } from '@/components/registry/ResourceRegister';
import { WeeklyModules } from './WeeklyModules';
import { useResources } from './useResources';
import { ResourcePanel } from './ResourcePanel';
import type { ContentLibraryInputs } from '@/types/registry/content';

export function ContentLibrary({
    contentSummary,
    manuscriptV1,
    initialResources,
    initialModules,
    groups,
    items,
    contents,
    resourceAuthor,
    versionHistory,
    attachedResourceId,
}: ContentLibraryInputs) {
    const desk = useDesk();
    const { selection, allowed, save } = useUploadPolicy(groups);
    const [tab, setTab] = useState(0);
    const { files, selected, selectResource, restore, saveAccess, close, browse, upload, pickFiles, picker } =
        useResources({
            initialResources,
            allowed,
            onUpload: () => setTab(1),
            notify: desk.notify,
        });

    return (
        <Register
            title="Content library"
            eyebrow="Content"
            description="Weekly modules, chapter manuscripts and the resources attached to them, with versioning and access control."
            actions={
                <>
                    <Action icon="chart" onClick={() => exportRecords('content-report', files)}>
                        Content report
                    </Action>
                    <Action icon="upload" variant="primary" onClick={browse}>
                        Upload resource
                    </Action>
                </>
            }
            overlay={
                <>
                    {desk.overlay}
                    {selected && (
                        <ResourcePanel
                            file={selected}
                            manuscriptV1={selected.id === attachedResourceId ? manuscriptV1 : undefined}
                            attachedWeek={selected.id === attachedResourceId ? contentSummary.attachedWeek : undefined}
                            {...{ versionHistory, resourceAuthor, restore, saveAccess, close }}
                        />
                    )}
                </>
            }
            active={tab}
            select={setTab}
            tabs={[['Modules and resources'], ['Resource register'], ['Authoring checklist']]}
        >
            <input
                type="file"
                hidden
                ref={picker}
                multiple
                aria-label="Select resources"
                accept={allowed.map((x) => `.${x}`).join(',')}
                onChange={pickFiles}
            />
            <WeeklyModules {...{ initialModules, contentSummary, contents, desk }} visible={tab === 0} />
            {tab !== 2 && <ResourceRegister
                files={files}
                browse={browse}
                upload={upload}
                onSelect={selectResource}
            />}
            {tab === 2 && <Checklist items={items} />}
            {tab !== 0 && <ContentPolicy
                desk={desk}
                groups={groups}
                selection={selection}
                save={save}
            />}
            <Note>
                Resource access can be scheduled by week and restricted by delivery mode. Replacing a file keeps the
                previous version available for audit and for students who downloaded it.
            </Note>
        </Register>
    );
}
