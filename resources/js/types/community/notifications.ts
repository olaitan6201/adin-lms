export type NotificationPreferences = {
    defaultsNotice: string;
    categories: {
        title: string;
        description: string;
        digest: string;
        channels: {
            label: string;
            enabled: boolean;
        }[];
    }[];
    switches: {
        name: string;
        description: string;
        enabled: boolean;
    }[];
    devices: {
        device: string;
        location: string;
        last: string;
        state: string;
        current: boolean;
    }[];
    quietHours: {
        start: string;
        end: string;
        description: string;
    };
    escalation: {
        description: string;
        timing: string;
    };
};
