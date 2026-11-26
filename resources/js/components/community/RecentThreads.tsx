import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Thread } from '@/types/community/communication';

type Props = {
    topics: Thread[];
    openTopic: (id: string) => void;
};
export function RecentThreads({ topics, openTopic }: Props) {
    return (
        <Card
            className="[&_th:last-child]:w-[90px]"
            title="Recent threads"
            subtitle="Threads needing moderation or a lecturer response"
            actions={<Badge tone="amber">{topics.filter((t) => !t.responses.length).length} need review</Badge>}
        >
            <Table
                columns={['Thread', 'Author', 'Replies', 'Updated', '']}
                rowKeys={topics.map((topic) => topic.id)}
                rows={topics.map((t) => [
                    <div key="thread" className="min-w-0">
                        <p className="truncate font-medium text-ink-800">
                            {t.title} {t.pinned && <Badge>Pinned</Badge>}
                        </p>
                        <p className="truncate text-[11.5px] text-ink-400">{t.tag}</p>
                    </div>,
                    <span key="author" className="text-[13px] text-ink-600">
                        {t.author}
                    </span>,
                    <span key="replies" className="text-[13px] tnum">
                        {t.replies}
                    </span>,
                    <span key="updated" className="text-[12.5px] text-ink-500">
                        {t.updated}
                    </span>,
                    <div key="actions" className="flex justify-end">
                        <Action size="sm" onClick={() => openTopic(t.id)}>
                            Open
                        </Action>
                    </div>,
                ])}
            />
        </Card>
    );
}
