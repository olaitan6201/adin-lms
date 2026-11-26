import { Field } from '@/components/registry/Desk';
import { Card } from '@/components/ui/layout/Card';
import type { LibraryModule, ContentSummary } from '@/types/registry/content';

export function ModuleFields({
    module,
    contentSummary,
    contents,
}: {
    module?: LibraryModule;
    contentSummary: ContentSummary;
    contents: string[];
}) {
    return (
        <>
            <Card title="Module definition">
                <div className="space-y-3">
                    <Field label="Topic title" required value={module?.title} />
                    <Field label="Objectives" type="textarea" value={module?.objectives} />
                    <Field label="Estimated study time" value={module?.time} />
                </div>
            </Card>
            {module && (
                <Card
                    title="Contents"
                    subtitle={
                        module.id === contentSummary.manuscriptModule
                            ? 'Nine items in publication order'
                            : `${module.items} learning items`
                    }
                >
                    {module.id === contentSummary.manuscriptModule && (
                        <ol className="divide-y divide-ink-100">
                            {contents.map((c, i) => (
                                <li className="flex gap-2 py-2 text-sm" key={c}>
                                    {i + 1}　{c}
                                    <small className="ml-auto">Published</small>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>
            )}
        </>
    );
}
