import type { WorkspaceShellModel } from '@/types/navigation/shell';
import { navigationGroups, type Destination } from '../portal/navigationGroups';

export type PortalProps = {
    screenKey?: string;
    signedIn?: boolean;
    workspaceHome?: string;
    branding?: { institution: string; logoWhite: string; logoFull: string };
    portalIdentity?: { name: string; role: string } | null;
    academicLinks?: Destination[];
};

export function liveWorkspaceShell(props: PortalProps): WorkspaceShellModel {
    const signedIn = props.signedIn === true;
    const routes = document.body.dataset;
    const home = signedIn ? props.workspaceHome ?? '/dashboard' : '/portal';
    const availableGroups = navigationGroups(signedIn, props.academicLinks ?? [], home);
    const groups = availableGroups.map(({ label, links }) => ({
        label,
        links: links.flatMap(({ href, label, Icon }) => href ? [{ href, label, Icon }] : []),
    }));

    return {
        brand: {
            name: 'AdinOpen LMS',
            institution: props.branding?.institution ?? 'AdinOpen LMS',
            crest: props.branding?.logoWhite
                ? { kind: 'image', src: props.branding.logoWhite }
                : { kind: 'symbol', href: '/brand/adin/crest.svg#crest-art' },
        },
        notices: [],
        live: {
            groups,
            account: signedIn ? props.portalIdentity ?? null : null,
            home,
            notifications: signedIn ? routes.inbox : undefined,
            settings: signedIn
                ? props.academicLinks?.find(link => link.label === 'Notification settings')?.href
                : undefined,
            profile: signedIn ? routes.profile : undefined,
            signedIn,
        },
    };
}
