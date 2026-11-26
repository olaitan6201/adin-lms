import { NativeSelectOption } from '@/components/ui/native-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@inertiajs/react';
import { OperationsInput, OperationsSelect, CorrectionFocus } from '../OperationsFields';
import type { Infrastructure } from './InfrastructurePanel';

export function MonitoringSettings({ settings }: { settings: Infrastructure['settings'] }) {
    return (
        <Card>
            <CardContent>
                <Form id="monitor-settings" className="min-w-0" action="/operations/infrastructure" method="post">
                    {({ errors, processing, recentlySuccessful }) => (
                        <fieldset className="grid gap-3">
                            <legend className="font-semibold">Monitoring and attendance integration</legend>
                            <CorrectionFocus errors={errors} />
                            <OperationsInput
                                label="Storage warning (MiB)"
                                error={errors.storage_mib}
                                name="storage_mib"
                                type="number"
                                min="1"
                                max="100000000"
                                defaultValue={settings.storage_mib}
                                required
                            />
                            <OperationsInput
                                label="Database warning (ms)"
                                error={errors.probe_ms}
                                name="probe_ms"
                                type="number"
                                min="1"
                                max="60000"
                                defaultValue={settings.probe_ms}
                                required
                            />
                            <OperationsSelect
                                label="Attendance bridge key slot"
                                error={errors.bridge_slot}
                                name="bridge_slot"
                                defaultValue={settings.bridge_slot}
                            >
                                <NativeSelectOption value="primary">Primary host key</NativeSelectOption>
                                <NativeSelectOption value="standby">Standby host key</NativeSelectOption>
                                <NativeSelectOption value="disabled">Disabled</NativeSelectOption>
                            </OperationsSelect>
                            <p>
                                Changing slots takes effect on the next check-in. Provision the matching key on the host and at the provider
                                first.
                            </p>
                            <Button variant="outline" disabled={processing}>
                                Save infrastructure settings
                            </Button>
                            {recentlySuccessful && <p role="status">Infrastructure settings saved.</p>}
                        </fieldset>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
