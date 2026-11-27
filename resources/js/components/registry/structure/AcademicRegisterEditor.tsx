import { Form } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { AcademicRegisterFields } from './AcademicRegisterFields';
import type { Department } from './liveRecords';
import type { RegisterRecords, RegisterSelection } from './registerRecords';

const labels = {
    'shared-programmes': 'shared programme',
    'programme-levels': 'programme level',
    specializations: 'specialization',
    pathways: 'pathway',
};

type AcademicRegisterEditorProps = {
    selection: RegisterSelection;
    records: RegisterRecords;
    departments: Department[];
    close: () => void;
    saved: () => void;
};

export function AcademicRegisterEditor({ selection, records, departments, close, saved }: AcademicRegisterEditorProps) {
    const [saving, setSaving] = useState(false);
    const saveState = useRef<'idle' | 'saving' | 'unmounted'>('idle');

    const { kind, record } = selection;
    const label = labels[kind];
    const action = record ? `${records.actions[kind]}/${record.id}` : records.actions[kind];

    useLayoutEffect(() => {
        saveState.current = 'idle';

        return () => {
            saveState.current = 'unmounted';
        };
    }, []);

    function canSubmit() {
        return saveState.current === 'idle';
    }

    function startSave() {
        saveState.current = 'saving';
        setSaving(true);
    }

    function finishSave() {
        if (saveState.current === 'saving') {
            saveState.current = 'idle';
            setSaving(false);
        }
    }

    function confirmSave() {
        if (saveState.current === 'saving') {
            saved();
        }
    }

    function dismiss() {
        if (saveState.current === 'idle') {
            close();
        }
    }

    return (
        <Drawer
            title={`${record ? 'Manage' : 'Add'} ${label}`}
            close={dismiss}
            closeDisabled={saving}
            className="structure-register-drawer"
            wrapTabFocus
        >
            <Form
                action={action}
                method={record ? 'patch' : 'post'}
                onBefore={canSubmit}
                onStart={startSave}
                onSuccess={confirmSave}
                onFinish={finishSave}
                className="space-y-5"
            >
                {({ errors }) => (
                    <>
                        <AcademicRegisterFields
                            selection={selection}
                            records={records}
                            departments={departments}
                            errors={errors}
                            disabled={saving}
                        />
                        <p role="status" className={saving ? 'text-sm text-ink-700' : 'sr-only'}>
                            {saving ? 'Saving changes…' : ''}
                        </p>
                        <div className="flex flex-wrap justify-end gap-2">
                            <Action onClick={dismiss} variant="outline" disabled={saving}>
                                Cancel
                            </Action>
                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={saving}
                            >
                                {record ? 'Save changes' : `Add ${label}`}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </Drawer>
    );
}
