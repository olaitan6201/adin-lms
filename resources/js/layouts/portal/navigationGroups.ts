import {
    Bell,
    BookOpen,
    Building2,
    CalendarDays,
    ChartNoAxesCombined,
    ClipboardList,
    Download,
    Home,
    Layers,
    LayoutDashboard,
    LogIn,
    Mail,
    Search,
    ShieldCheck,
    UserRound,
} from 'lucide-react';

export type Destination = {
    label: string;
    href: string
};

export function navigationGroups(signedIn: boolean, academicLinks: Destination[], home: string) {
    const routes = document.body.dataset;
    const supplied = (path: string) => academicLinks.find(link => link.href === path)?.href;
    const grouped = new Set([
        '/calendar',
        '/student/downloads',
        '/admin/qa',
        '/community/notification-settings',
        '/examinations-office',
    ]);
    return signedIn
        ? [
              { label: 'Overview', links: [{ label: 'Dashboard', href: home, Icon: LayoutDashboard }] },
              {
                  label: 'Learning',
                  links: [
                      { label: 'My courses', href: routes.courses, Icon: BookOpen },
                      { label: 'Search courses', href: routes.search, Icon: Search },
                      { label: 'Downloads', href: supplied('/student/downloads'), Icon: Download },
                  ],
              },
              {
                  label: 'Academic',
                  links: academicLinks
                      .filter(link => !grouped.has(link.href))
                      .map(link => ({
                          ...link,
                          Icon: ['/academics', '/admin/structure'].includes(link.href) ? Building2 : Layers,
                      })),
              },
              {
                  label: 'Assessment',
                  links: [
                      { label: 'Examinations office', href: supplied('/examinations-office'), Icon: ClipboardList },
                  ],
              },
              {
                  label: 'Engagement',
                  links: [
                      { label: 'Inbox', href: routes.inbox, Icon: Mail },
                      { label: 'Calendar', href: supplied('/calendar'), Icon: CalendarDays },
                      { label: 'Reports', href: routes.reports, Icon: ChartNoAxesCombined },
                  ],
              },
              {
                  label: 'System',
                  links: [{ label: 'QA and compliance', href: supplied('/admin/qa'), Icon: ShieldCheck }],
              },
              {
                  label: 'Personal',
                  links: [
                      {
                          label: 'Notification settings',
                          href: supplied('/community/notification-settings'),
                          Icon: Bell,
                      },
                      { label: 'Profile', href: routes.profile, Icon: UserRound },
                  ],
              },
          ]
        : [
              {
                  label: 'Portal',
                  links: [
                      { label: 'Portal home', href: '/portal', Icon: Home },
                      { label: 'Sign in', href: '/login', Icon: LogIn },
                  ],
              },
          ];
}
