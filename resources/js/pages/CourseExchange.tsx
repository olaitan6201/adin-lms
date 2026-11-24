import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function CourseExchange({ csrf }: { csrf: string }) {
    const [offering, setOffering] = useState('');
    const errors = usePage().props.errors;
    const path = `/operations/courses/${encodeURIComponent(offering)}`;
    return <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
        <Head title="Course exchange" /><h1 className="text-3xl font-semibold">Course exchange</h1>
        {errors.package && <p role="alert">{String(errors.package)}</p>}
        <label>Offering UUID<input className="block w-full border p-2" value={offering} onChange={e => setOffering(e.target.value)} /></label>
        <p>Exchange plain-text chapters, with HTTPS link materials in the native format. Review content for personal or licensed information first.</p>
        {offering && <div className="flex flex-wrap gap-4">
            <a className="underline" href={`${path}/export/native`}>Download native chapters</a>
            <a className="underline" href={`${path}/export/scorm`}>Download SCORM 1.2 assets</a>
        </div>}
        <form method="post" action={`${path}/import`} encType="multipart/form-data" className="grid gap-3">
            <input type="hidden" name="_token" value={csrf} />
            <label>Import into an empty draft offering (ZIP, up to 1 MiB)
                <input className="block w-full" required type="file" accept=".zip" name="package" /></label>
            <button disabled={!offering} className="bg-teal-900 p-2 text-white">Import chapters</button>
        </form>
    </main>;
}
