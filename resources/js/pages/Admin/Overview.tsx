import { Head } from '@inertiajs/react';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Section } from '@/components/overview/AdminOverviewSection';
import { Approvals, RecentActivity, ServiceHealth } from '@/components/overview/AdminOverviewRecords';
import { ExamReadiness } from '@/components/overview/ExamReadiness';
import { AreaChart, DeliveryColumns } from '@/components/overview/Charts';
import { Columns, Tiles } from '@/components/overview/OverviewParts';
import { PercentageBars } from '@/components/overview/PercentageBars';
import type { AdminOverviewData } from '@/types/insights/adminOverview';

export default function Overview({ overview }: { overview: AdminOverviewData }) {
    const { links, enrolment, delivery, service, participation } = overview;

    return (
        <main>
            <Head title="Institution overview" />
            <PageHeader
                eyebrow="Institution"
                title="Institution overview"
                description={overview.description}
                actions={
                    <>
                        {links.reports && <Action icon="download" href={links.reports}>Reports</Action>}
                        {links.offerings && (
                            <Action icon="plus" variant="primary" href={links.offerings}>
                                Course offerings
                            </Action>
                        )}
                    </>
                }
            />
            <div className="role-overview space-y-5">
                <Tiles items={overview.tiles} />
                <Columns
                    left={
                        <Section
                            title="Enrolment over the session"
                            subtitle={enrolment.session}
                            labels={enrolment.labels}
                            values={enrolment.values}
                            actions={links.structure && (
                                <Action
                                    icon="external"
                                    variant="ghost"
                                    size="sm"
                                    href={links.structure}
                                >
                                    Academic structure
                                </Action>
                            )}
                        >
                            <AreaChart
                                labels={enrolment.labels}
                                values={enrolment.values}
                                color="#10B981"
                                height={250}
                                label="Recorded enrolment by period"
                            />
                        </Section>
                    }
                    right={<ServiceHealth service={service} />}
                />
                <Columns
                    left={<Approvals approvals={overview.approvals} />}
                    right={<ExamReadiness {...overview.examinations} />}
                />
                <Columns
                    seven
                    left={
                        <Section
                            title="Course delivery activity"
                            labels={delivery.labels}
                            values={delivery.values}
                        >
                            <DeliveryColumns labels={delivery.labels} values={delivery.values} />
                        </Section>
                    }
                    right={
                        <Section title="Completion by faculty" subtitle={participation.summary}>
                            {participation.metrics.length > 0 && <PercentageBars items={participation.metrics} />}
                        </Section>
                    }
                />
                <RecentActivity activity={overview.activity} />
            </div>
        </main>
    );
}
