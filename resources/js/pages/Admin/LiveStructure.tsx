import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { LiveHierarchy } from '@/components/registry/structure/LiveHierarchy';
import { LiveRegisters } from '@/components/registry/structure/LiveRegisters';
import { StructureHealthSummary } from '@/components/registry/structure/StructureHealthSummary';
import { StructureEditor } from '@/components/registry/structure/StructureEditor';
import { StructureImportDrawer } from '@/components/registry/structure/StructureImportDrawer';
import type { Selection, StructureProps } from '@/components/registry/structure/liveRecords';
import { Action } from '@/components/ui/controls/Action';
import { Note } from '@/components/ui/feedback/Note';
import { PageHeader } from '@/components/ui/layout/PageHeader';

export default function LiveStructure(props: StructureProps) {
    const [selection, select] = useState<Selection | 'import' | null>(null);
    const [notice, setNotice] = useState('');

    function open(next: Selection | 'import') {
        setNotice('');
        select(next);
    }

    function close() {
        select(null);
    }

    function saved() {
        close();
        setNotice('Structure record saved.');
    }

    function imported(count: number) {
        close();
        setNotice(`${count} structure ${count === 1 ? 'record' : 'records'} added.`);
        router.reload({ only: ['faculties', 'departments', 'programmes', 'health', 'student_count_session'] });
    }

    return (
        <main className="min-w-0">
            <Head title="Academic structure" />
            <PageHeader
                eyebrow="Academic organisation"
                title="Academic structure"
                description="The hierarchy that scopes oversight, rosters, curricula and reporting."
                actions={
                    <>
                        <Action icon="upload" onClick={() => open('import')}>Import structure</Action>
                        <Action icon="plus" variant="primary" onClick={() => open({ kind: 'unit' })}>
                            Add faculty or department
                        </Action>
                    </>
                }
            />
            <div className="space-y-5">
                <p role="status" className={notice ? 'text-sm font-medium text-brand-800' : 'sr-only'}>{notice}</p>
                <div className="grid items-start gap-5 xl:grid-cols-[2fr_1fr]">
                    <LiveHierarchy records={props} edit={open} />
                    <StructureHealthSummary records={props} edit={open} />
                </div>
                <LiveRegisters records={props} edit={open} />
                <Note>Faculty and department oversight follows assigned staff roles, not this structure register.</Note>
            </div>
            {selection === 'import' && (
                <StructureImportDrawer urls={props.import} close={close} imported={imported} />
            )}
            {selection && selection !== 'import' && (
                <StructureEditor
                    selection={selection}
                    structure={props}
                    close={close}
                    saved={saved}
                />
            )}
        </main>
    );
}
