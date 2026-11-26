import type { BankDraft } from '@/types/assessments/cbt';
import { Drawer } from '../Drawer';
import { type Values, Editor } from '../Editor';

export function NewBankPanel({ officer, close, save }: {
    officer: boolean;
    close: () => void;
    save: (draft: BankDraft) => void;
}) {
    function submit(values: Values) {
        save({
            name: values['Bank name'],
            course: values.Course,
            types: values.Types,
            security: values.Access,
        });
    }

    return (
        <Drawer title="New bank" close={close}>
            <Editor
                fields={[
                    { label: 'Bank name', required: true },
                    { label: 'Course', required: true },
                    { label: 'Types', initial: 'MCQ' },
                    { label: 'Access', options: officer ? ['restricted', 'open'] : ['open'] },
                ]}
                save={submit}
            />
        </Drawer>
    );
}
