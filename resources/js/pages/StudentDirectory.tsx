import { Form, Head, Link } from '@inertiajs/react';

type Student = { id: string; external_student_id: string; matric_number: string | null; source_name: string | null; status: string | null };
type Props = { students: Student[]; q: string; next: string | null; previous: string | null; manage: boolean; link: boolean; receipt: string | null };

export default function StudentDirectory({ students, q, previous, next, manage, link, receipt }: Props) {
    return <main className="mx-auto max-w-3xl space-y-5 px-5 py-12">
        <Head title="Student records" />
        <h1 className="text-3xl font-semibold">Student records</h1>
        <Form action="/students" method="get">
            <label>Find by name, matric number or upstream ID <input name="q" defaultValue={q} className="border p-2" /></label>
            <button className="p-2 underline">Search</button>
        </Form>
        <ul className="divide-y">{students.map(s => <li key={s.id} className="py-3">
            <Link className="underline" href={`/students/${s.id}/history`}>{s.source_name || s.external_student_id}</Link>
            {' · '}{s.matric_number || 'Awaiting matric number'} · {s.status || 'Awaiting profile'}
        </li>)}</ul>
        {!students.length && <p>No matching student records.</p>}
        {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
        {receipt && <p role="status">{receipt}</p>}
        {link && <details><summary>Link a verified LMS account</summary>
            <Form action="/students/link" method="post" className="grid gap-3">{({ errors, processing }) => <>
                <label>Upstream student ID <input className="border p-2" name="student" required /></label>
                <label>Existing LMS account email <input className="border p-2" type="email" name="account" required /></label>
                <label><input type="checkbox" name="verified" value="1" required /> I checked both identities against the registrar's record.</label>
                {Object.entries(errors).map(([k, v]) => <p role="alert" key={k}>{v}</p>)}
                <button disabled={processing} className="justify-self-start underline">Link verified account</button>
            </>}</Form>
        </details>}
        {manage && <section><h2 className="text-xl font-semibold">Reconcile registrar feeds</h2>
            <p>Use an authorised upstream export. Corrections to official registration belong with the registrar.</p>
            {(['registrations', 'profiles'] as const).map(kind => <details key={kind} className="border-b py-3">
                <summary>Import {kind}</summary>
                <p>{kind === 'profiles' ? 'CSV or single-sheet XLSX: student_id, matric_number, name, email, programme, level, session, status.' : 'CSV: student_id, offering_id, status, revision. Replayed rows are ignored.'}</p>
                <Form action={`/students/feeds/${kind}`} method="post">{({ processing, errors }) => <>
                    <label>Registrar export <input type="file" name="feed" accept={kind === 'profiles' ? '.csv,.xlsx' : '.csv'} required /></label>
                    <button disabled={processing} className="rounded bg-teal-900 px-4 py-2 text-white">Reconcile {kind}</button>
                    {errors.feed && <p role="alert">{errors.feed}</p>}
                </>}</Form>
            </details>)}
        </section>}
    </main>;
}
