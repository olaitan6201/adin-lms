import { useState } from 'react';
import { AccessibilityPanel } from '@/components/registry/AccessibilityPanel';
import { exportRecords, Register, useDesk, type Tab } from '@/components/registry/Desk';
import { InstitutionSettings, Privacy } from '@/components/registry/InstitutionSettings';
import { IntegrationSettings } from '@/components/registry/IntegrationSettings';
import { RecoverySettings } from '@/components/registry/RecoverySettings';
import { Records, status } from '@/components/registry/Records';
import { SecurityAudit } from '@/components/registry/SecurityAudit';
import { Action } from '@/components/ui/controls/Action';
import { targets, verified } from '@/data/registry/accessibility';
import {
    auditLog,
    integrations,
    performanceMetrics,
    portability,
    retentionRules,
    securityEvents,
} from '@/data/registry/governance';
import { restoreDrillDate } from '@/data/registry/recoverySchedule';
import {
    accessibilitySummary,
    features,
    identity,
    initialBackups,
    policy,
    privacy,
    recoveryMetrics,
    shortcuts,
} from '@/data/registry/systemSettings';

export default function Administration() {
    const [tab, setTab] = useState(0);
    const [connections, setConnections] = useState(integrations);
    const [backups, setBackups] = useState(initialBackups);
    const desk = useDesk();
    const tabs: Tab[] = [
        ['Settings'],
        ['Integrations', connections.length],
        ['Security and audit'],
        ['Backup and recovery'],
        ['Data protection'],
        ['Accessibility'],
    ];

    function updateConnection(connection: (typeof integrations)[number]) {
        setConnections((current) => current.map((item) => (item.id === connection.id ? connection : item)));
    }

    function runBackup() {
        const when = new Date().toLocaleString('en-GB');
        setBackups((current) => [['Manual snapshot', when, '—', 'Queued', 'Point in time'], ...current]);
    }

    const performance = (
        <Records
            title="Service performance"
            subtitle="Measured against the agreed targets"
            columns={['Metric', 'Observed', 'Target', 'Status']}
            rows={performanceMetrics.map((metric) => [
                metric.metric,
                metric.value,
                metric.target,
                metric.state === 'good' ? status('On target', 'emerald') : status('Watch', 'amber'),
            ])}
        />
    );

    function exportAudit() {
        exportRecords('audit-export', auditLog);
    }

    function showSystemHealth() {
        desk.show({ title: 'System health', body: performance });
    }

    return (
        <Register
            eyebrow="System"
            title="Administration"
            description="Settings, integrations, security, recovery, data protection and the portability paths the institution has agreed."
            overlay={desk.overlay}
            active={tab}
            select={setTab}
            tabs={tabs}
            actions={
                <>
                    <Action
                        icon="download"
                        onClick={exportAudit}
                    >
                        Audit export
                    </Action>
                    <Action
                        icon="activity"
                        variant="primary"
                        onClick={showSystemHealth}
                    >
                        System health
                    </Action>
                </>
            }
        >
            <div className="grid min-w-0 grid-cols-1 gap-5">
                <div className={tab === 0 ? 'space-y-5' : 'hidden'}>
                    <InstitutionSettings
                        identity={identity}
                        policy={policy}
                        features={features}
                    />
                </div>
                {tab === 1 && (
                    <IntegrationSettings
                        connections={connections}
                        portability={portability}
                        desk={desk}
                        update={updateConnection}
                    />
                )}
                {tab === 2 && (
                    <SecurityAudit
                        events={securityEvents}
                        audit={auditLog}
                        desk={desk}
                    />
                )}
                {tab === 3 && (
                    <>
                        <RecoverySettings
                            backups={backups}
                            desk={desk}
                            runBackup={runBackup}
                            metrics={recoveryMetrics}
                            drillDate={restoreDrillDate}
                        />
                        {performance}
                    </>
                )}
                <div className={tab === 4 ? 'space-y-5' : 'hidden'}>
                    <Privacy
                        privacy={privacy}
                        retentionRules={retentionRules}
                    />
                </div>
                {tab === 5 && (
                    <AccessibilityPanel
                        verified={verified}
                        targets={targets}
                        accessibilitySummary={accessibilitySummary}
                        shortcuts={shortcuts}
                    />
                )}
            </div>
        </Register>
    );
}
