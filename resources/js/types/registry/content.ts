export type UploadGroup = {
    id: string;
    label: string;
    extensions?: string[];
    description?: string;
    validation: string;
};

export type LibraryModule = {
    id: string;
    week: string;
    title: string;
    state: string;
    objectives: string;
    time: string;
    items: number;
    completion: number;
};

export type LibraryResource = {
    id: string;
    name: string;
    type: string;
    icon: string;
    size: string;
    updated: string;
    access: string;
    version: string;
    from: string;
    until: string;
    latest: number;
    source: boolean;
    download: boolean;
};

export type ContentSummary = {
    code: string;
    manuscriptModule: string;
    manuscriptTitle: string;
    attachedWeek: string;
    items: number;
};

export type ContentLibraryInputs = {
    manuscriptV1: string;
    contentSummary: ContentSummary;
    initialResources: LibraryResource[];
    initialModules: LibraryModule[];
    groups: UploadGroup[];
    items: string[][];
    contents: string[];
    resourceAuthor: string;
    versionHistory: {
        date: string;
        size: string;
    }[];
    attachedResourceId: string | undefined;
};
