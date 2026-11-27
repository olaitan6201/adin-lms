import { useState, type MouseEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { AcademicRegister } from '@/components/registry/structure/AcademicRegister';
import { AcademicRegisterEditor } from '@/components/registry/structure/AcademicRegisterEditor';
import { LiveHierarchy } from '@/components/registry/structure/LiveHierarchy';
import { LiveRegisters } from '@/components/registry/structure/LiveRegisters';
import { StructureHealthSummary } from '@/components/registry/structure/StructureHealthSummary';
import { StructureEditor } from '@/components/registry/structure/StructureEditor';
import { StructureImportDrawer } from '@/components/registry/structure/StructureImportDrawer';
import type { Selection, StructureProps } from '@/components/registry/structure/liveRecords';
import type { RegisterSelection } from '@/components/registry/structure/registerRecords';
import type { ImportKind } from '@/components/registry/structure/structureImportFields';
import { Action } from '@/components/ui/controls/Action';
import { Note } from '@/components/ui/feedback/Note';
import { PageHeader } from '@/components/ui/layout/PageHeader';

export default function LiveStructure(props: StructureProps) {
    const [selection, select] = useState<Selection | null>(null);
    const [registerSelection, selectRegister] = useState<RegisterSelection | null>(null);
    const [importKind, setImportKind] = useState<ImportKind | null>(null);
    const [notice, setNotice] = useState('');

    function open(next: Selection) {
        setNotice('');
        select(next);
    }

    function openImport(kind: ImportKind, event: MouseEvent<Element>) {
        if (event.currentTarget instanceof HTMLButtonElement) {
            event.currentTarget.focus({ preventScroll: true });
        }

        setNotice('');
        setImportKind(kind);
    }

    function close() {
        select(null);
        selectRegister(null);
        setImportKind(null);
    }

    function editRegister(next: RegisterSelection) {
        setNotice('');
        selectRegister(next);
    }

    function saved() {
        close();
        setNotice('Structure record saved.');
    }

    function imported(count: number) {
        close();
        if (importKind === 'register') {
            setNotice(count === 0 ? 'No shared register records needed adding.' : `${count} shared register ${count === 1 ? 'record' : 'records'} added.`);
            router.reload({ only: ['register'] });
            return;
        }

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
                        <Action icon="upload" onClick={event => openImport('hierarchy', event)} aria-haspopup="dialog">
                            Import structure
                        </Action>
                        <Action icon="upload" onClick={event => openImport('register', event)} aria-haspopup="dialog">
                            Import shared register
                        </Action>
                        <Action
                            icon="plus"
                            variant="primary"
                            onClick={() => open({ kind: 'unit' })}
                        >
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
                <AcademicRegister records={props.register} departments={props.departments} edit={editRegister} />
                <LiveRegisters records={props} edit={open} />
                <Note>Faculty and department oversight follows assigned staff roles, not this structure register.</Note>
            </div>
            {importKind && (
                <StructureImportDrawer
                    kind={importKind}
                    urls={importKind === 'register' ? props.registerImport : props.import}
                    close={close}
                    imported={imported}
                />
            )}
            {selection && (
                <StructureEditor
                    selection={selection}
                    structure={props}
                    close={close}
                    saved={saved}
                />
            )}
            {registerSelection && (
                <AcademicRegisterEditor
                    selection={registerSelection}
                    records={props.register}
                    departments={props.departments}
                    close={close}
                    saved={saved}
                />
            )}
        </main>
    );
}
