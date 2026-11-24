import { Head, Link } from '@inertiajs/react';

export default function Home() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-16 text-slate-900">
            <Head title="Adin LMS" />
            <p className="border-t-4 border-teal-800 pt-6 font-semibold text-teal-800">Adin LMS</p>
            <h1 className="my-4 text-4xl font-bold">Learning portal</h1>
            <p>Course registration is managed through the institution’s registration platform.</p>
            <Link className="mt-6 inline-block underline" href="/courses">Open my courses</Link>
        </main>
    );
}
