import {
    contentSummary,
    initialResources,
    initialModules,
    groups,
    items,
    contents,
    allowed,
    resourceAuthor,
    versionHistory,
} from '@/data/registry/contentLibrary';
import { ContentLibrary } from '@/components/registry/content/ContentLibrary';

export default function Content() {
    return (
        <ContentLibrary
            {...{
                contentSummary,
                initialResources,
                initialModules,
                groups,
                items,
                contents,
                allowed,
                resourceAuthor,
                versionHistory,
                attachedResourceId: initialResources[0]?.id,
            }}
        />
    );
}
