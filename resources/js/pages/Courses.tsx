import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';

export type CourseSummary = {
    id: string;
    external_offering_id: string;
    title: string | null;
    code: string | null;
    status: string;
    section: string | null;
    delivery_mode: string | null;
};

type CoursesProps = {
    courses: CourseSummary[];
    historyUrl: string | null;
    staffUrl: string | null;
    workloadUrl: string | null;
};

export default function Courses({ courses, historyUrl, staffUrl, workloadUrl }: CoursesProps) {
    const shortcuts = [
        { label: 'My profile', href: '/profile' },
        { label: 'Academic history', href: historyUrl },
        { label: 'Manage lecturers', href: staffUrl },
        { label: 'My teaching workload', href: workloadUrl },
    ];

    return (
        <main className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6">
            <Head title="My courses" />
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">Course catalogue</p>
                <h1 className="text-3xl font-semibold">My courses</h1>
                <p>
                    {courses.length} {courses.length === 1 ? 'offering' : 'offerings'} linked to your account
                </p>
            </header>
            <nav aria-label="Course shortcuts" className="mb-4 flex flex-wrap gap-4">
                {shortcuts.map(
                    ({ href, label }) =>
                        href && (
                            <Link key={href} href={href} className="underline">
                                {label}
                            </Link>
                        ),
                )}
            </nav>
            {courses.length === 0 && <p>No active course registrations are linked to your account.</p>}
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                    <li key={course.id}>
                        <Card className="h-full">
                            <CardHeader>
                                <Badge variant="secondary">
                                    {course.code || 'Course offering'} · {course.status}
                                </Badge>
                                <CardTitle>
                                    <Link className="underline" href={`/courses/${course.id}`}>
                                        {course.title || course.external_offering_id}
                                    </Link>
                                </CardTitle>
                                <CardDescription>
                                    {[
                                        course.external_offering_id,
                                        course.section && `Section ${course.section}`,
                                        course.delivery_mode,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </li>
                ))}
            </ul>
        </main>
    );
}
