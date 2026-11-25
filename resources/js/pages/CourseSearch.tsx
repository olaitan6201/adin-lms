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
        <main className="mx-auto max-w-3xl px-6 py-10">
            <Head title="Search my courses" />
            <header className="space-y-2">
                <Link href="/courses" className="underline">My courses</Link>
                <h1 className="text-3xl font-semibold">Search my courses</h1>
                <p>Find a published course in your current registrations.</p>
            </header>
            <Form action="/search" method="get" role="search" className="my-6">
                {({ processing, errors }) => (
                    <>
                        <label htmlFor="course-query" className="block font-semibold">Course search</label>
                        <div className="course-search-controls">
                            <input
                                id="course-query"
                                type="search"
                                name="q"
                                defaultValue={props.term}
                                maxLength={80}
                                placeholder="Course title or code"
                                aria-invalid={Boolean(errors.q)}
                                aria-describedby={errors.q ? 'search-error' : undefined}
                            />
                            <button disabled={processing}>{processing ? 'Searching…' : 'Search'}</button>
                        </div>
                        {errors.q && <p id="search-error" role="alert">{errors.q}</p>}
                    </>
                )}
            </Form>
            <p role="status">{resultSummary(props)}</p>
            <ul className="mt-4 divide-y divide-slate-300">
                {props.matches.map(course => (
                    <li key={course.id} className="space-y-1 py-4">
                        <Link href={`/courses/${course.id}`} className="font-semibold underline">
                            {course.code} · {course.title}
                        </Link>
                        {course.external_offering_id && <p>{course.external_offering_id}</p>}
                    </li>
                ))}
            </ul>
        </main>
    );
}
