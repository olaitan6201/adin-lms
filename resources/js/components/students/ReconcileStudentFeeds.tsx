import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { PortalField } from '@/components/forms/PortalForm';
import { Form } from '@inertiajs/react';
import { RegistryPanel } from '@/components/academics/RegistryPanel';

export function ReconcileStudentFeeds() {
    return (
        <RegistryPanel title="Reconcile registrar feeds">
            <p>Use an authorised upstream export. Corrections to official registration belong with the registrar.</p>
            {(['registrations', 'profiles'] as const).map((kind) => (
                <Collapsible key={kind} className="border-b py-3">
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                            Import {kind}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                        <p>
                            {kind === 'profiles'
                                ? 'CSV or single-sheet XLSX: student_id, matric_number, name, email, programme, level, session, status. The optional photo column accepts a JPEG data URL up to 256 KiB and 1024 × 1024 pixels. Blank leaves the existing photo unchanged.'
                                : 'CSV: student_id, offering_id, status, revision. Replayed rows are ignored.'}
                        </p>
                        <Form action={`/students/feeds/${kind}`} method="post">
                            {({ processing, errors }) => (
                                <>
                                    <PortalField
                                        label="Registrar export"
                                        type="file"
                                        name="feed"
                                        accept={kind === 'profiles' ? '.csv,.xlsx' : '.csv'}
                                        required
                                        error={errors.feed}
                                    />
                                    <Button disabled={processing}>Reconcile {kind}</Button>
                                </>
                            )}
                        </Form>
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </RegistryPanel>
    );
}
