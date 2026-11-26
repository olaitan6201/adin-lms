import { Action } from '@/components/ui/controls/Action';
import { type Desk, Field } from './Desk';
import { Metrics, Records, status } from './Records';

type Props = {
    backups: string[][];
    metrics: [string, string, string?][];
    drillDate: string;
    runBackup: () => void;
    desk: Desk;
};

export function RecoverySettings({ backups, metrics, drillDate, runBackup, desk }: Props) {
    function restore() {
        desk.show({
            title: 'Restore',
            submit: 'Schedule restore',
            previewNotice: 'Restore preview complete. No restore was scheduled.',
            body: <Field label="Backup" options={backups.map(([name, when]) => `${name} · ${when}`)} />,
        });
    }

    return (
        <Records
            title="Backup and recovery"
            subtitle="Scheduled backups, verification status and the agreed recovery objectives"
            tableClass="[&_th:last-child]:w-[150px] [&_td:last-child]:text-right"
            actions={
                <>
                    <Action icon="save" size="sm" onClick={runBackup}>
                        Run backup now
                    </Action>
                    <Action icon="refresh" size="sm" variant="primary" disabled={!backups.length} onClick={restore}>
                        Restore
                    </Action>
                </>
            }
            columns={['Job', 'When', 'Size', 'Verification', 'Recovery point', '']}
            rows={backups.map(([name, when, size, verification, point]) => [
                name,
                when,
                size,
                status(verification, verification === 'Passed' ? 'emerald' : 'amber'),
                point,
                <Action key="restore" size="sm" onClick={() => desk.notify(`Restore drill scheduled for ${drillDate}`)}>
                    Restore drill
                </Action>,
            ])}
        >
            <Metrics rows={metrics} />
        </Records>
    );
}
