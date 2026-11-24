import { Form, Head, Link } from '@inertiajs/react';

type Match = { id: string; code: string; title: string; external_offering_id: string | null };

export default function CourseSearch({ term, matches, truncated }: { term: string; matches: Match[]; truncated: boolean }) {
    return (
        <main className="mx-auto max-w-2xl px-6 py-12">
            <Head title="Search my courses" />
            <h1 className="mb-3 text-3xl font-semibold">Search my courses</h1>
            <p>Find published courses you are registered for by title, course code or offering ID.</p>
            <Form action="/search" method="get" role="search" className="my-6">
                {({ processing, errors }) => <>
                    <label htmlFor="course-query" className="block font-semibold">Course search</label>
                    <div className="course-search-controls">
                        <input id="course-query" type="search" name="q" defaultValue={term} maxLength={80}
                            aria-invalid={errors.q ? true : undefined} aria-describedby={errors.q ? 'search-error' : undefined} />
                        <button disabled={processing}>{processing ? 'Searching…' : 'Search'}</button>
                    </div>
                    {errors.q && <p id="search-error" role="alert">{errors.q}</p>}
                </>}
            </Form>
            <p role="status">{term && (truncated ? 'Showing the first 25 matches. Refine your search for more specific results.'
                : matches.length ? `${matches.length} ${matches.length === 1 ? 'course' : 'courses'} found for “${term}”.`
                : `No courses found for “${term}”. Try another title or code.`)}</p>
            <ul className="mt-4 divide-y divide-slate-300">
                {matches.map(match => <li key={match.id} className="py-3">
                    <Link href={`/courses/${match.id}`} className="font-semibold underline">{match.code} · {match.title}</Link>
                    {match.external_offering_id && <p>{match.external_offering_id}</p>}
                </li>)}
            </ul>
        </main>
    );
}
