import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, Head, Link } from '@inertiajs/react';

type CourseMatch = {
    id: string;
    code: string;
    title: string;
    external_offering_id: string | null;
};

type SearchProps = {
    term: string;
    matches: CourseMatch[];
    truncated: boolean;
};

function resultSummary({ term, matches, truncated }: SearchProps): string {
    if (!term) {
        return 'Search by course title, code or offering ID.';
    }

    if (truncated) {
        return 'Showing the first 25 matches. Refine your search for more specific results.';
    }

    if (!matches.length) {
        return `No courses found for “${term}”. Try another title or code.`;
    }

    const noun = matches.length === 1 ? 'course' : 'courses';

    return `${matches.length} ${noun} found for “${term}”.`;
}

export default function CourseSearch(props: SearchProps) {
    return (
        <main className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
            <Head title="Search my courses" />
            <Link href="/courses" className="underline">
                ← My courses
            </Link>
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">Course catalogue</p>
                <h1 className="text-3xl font-semibold">Search my courses</h1>
                <p>Find a published course in your current registrations.</p>
            </header>
            <Form action="/search" method="get" role="search" className="my-6 max-w-2xl">
                {({ processing, errors }) => (
                    <>
                        <Label htmlFor="course-query" className="block font-semibold">
                            Course search
                        </Label>
                        <div className="mt-2 flex gap-2">
                            <Input
                                id="course-query"
                                type="search"
                                name="q"
                                defaultValue={props.term}
                                maxLength={80}
                                placeholder="Course title or code"
                                aria-invalid={Boolean(errors.q)}
                                aria-describedby={errors.q ? 'search-error' : undefined}
                            />
                            <Button disabled={processing}>{processing ? 'Searching…' : 'Search'}</Button>
                        </div>
                        {errors.q && (
                            <p id="search-error" role="alert">
                                {errors.q}
                            </p>
                        )}
                    </>
                )}
            </Form>
            <p role="status">{resultSummary(props)}</p>
            <ul className="mt-4 space-y-2">
                {props.matches.map((course) => (
                    <li key={course.id}>
                        <Card>
                            <CardContent className="space-y-1">
                                <Link href={`/courses/${course.id}`} className="underline">
                                    {course.code} · {course.title}
                                </Link>
                                {course.external_offering_id && <p>{course.external_offering_id}</p>}
                            </CardContent>
                        </Card>
                    </li>
                ))}
            </ul>
        </main>
    );
}
