import {
    contentSummary,
    manuscriptV1,
    initialResources,
    initialModules,
    groups,
    items,
    contents,
    resourceAuthor,
    versionHistory,
} from '@/data/registry/contentLibrary';
import { ContentLibrary } from '@/components/registry/content/ContentLibrary';

export default function Content() {
    return (
        <ContentLibrary
            {...{
                contentSummary,
                manuscriptV1,
                initialResources,
                initialModules,
                groups,
                items,
                contents,
                resourceAuthor,
                versionHistory,
                attachedResourceId: initialResources[0]?.id,
            }}
        />
    );
}
