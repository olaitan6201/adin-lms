import { Head } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

type Offering = { id: string; external_offering_id: string | null; status: string };
type Props = { csrf: string; offerings: Offering[]; uploadLimit: number };
type Format = 'native' | 'scorm';

export default function CourseExchange({ csrf, offerings, uploadLimit }: Props) {
    const [offering, setOffering] = useState('');
    const [format, setFormat] = useState<Format>('native');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const match = offerings.find((item) => item.id === offering);
    const valid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(offering);
    const path = `/operations/courses/${encodeURIComponent(offering)}`;
    const control = 'block w-full rounded border border-slate-500 bg-white p-2 text-slate-950';
    const button = 'portal-action disabled:opacity-60';

    async function transfer(event: FormEvent<HTMLFormElement>, importing: boolean) {
        event.preventDefault();
        if (!valid || busy) return;
        const form = event.currentTarget;
        setBusy(true);
        setMessage('');
        setError('');
        try {
            const response = await fetch(importing ? `${path}/import` : `${path}/export/${format}`, {
                method: importing ? 'POST' : 'GET',
                headers: { Accept: 'application/json' },
                body: importing ? new FormData(form) : undefined,
            });
            if (!response.ok || response.redirected) {
                const failure = await response.json().catch(() => ({}));
                throw new Error(failure.errors?.package?.[0] ?? failure.errors?.file?.[0] ?? failure.message ?? 'Transfer failed. Check your session and try again.');
            }
            if (importing) {
                const result = await response.json();
                setMessage(`Restored ${result.imported} course record(s) to ${match?.external_offering_id ?? offering}.`);
                form.reset();
            } else {
                const url = URL.createObjectURL(await response.blob());
                const link = document.createElement('a');
                link.href = url;
                link.download = `course-${offering}-${format}.zip`;
                link.click();
                window.setTimeout(() => URL.revokeObjectURL(url), 30000);
                setMessage('Package ready. Check your downloads.');
            }
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Transfer failed.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="portal-page space-y-6">
            <Head title="Course exchange" />
            <header className="desk-heading">
                <p className="portal-kicker">Teaching administration</p>
                <h1 className="portal-title">Course exchange</h1>
                <p>Move teaching content between offerings. Enrolments, posts, submissions and grades stay behind.</p>
            </header>
            <div>
                <label className="block font-semibold" htmlFor="exchange-offering">Offering</label>
                <input id="exchange-offering" className={control} list="exchange-offerings" value={offering} disabled={busy}
                    placeholder="Choose a recent offering or paste its UUID"
                    onChange={(event) => { setOffering(event.target.value.trim()); setError(''); setMessage(''); }} />
                <datalist id="exchange-offerings">
                    {offerings.map((item) => <option key={item.id} value={item.id}>{item.external_offering_id ?? item.id} · {item.status}</option>)}
                </datalist>
            </div>
            <p>{match ? `${match.external_offering_id ?? match.id} · ${match.status}` : offering && !valid ? 'Enter a complete offering UUID.' : 'Choose the source for a download or the destination for a restore.'}</p>
            <div className="grid gap-5 md:grid-cols-2">
                <form onSubmit={(event) => transfer(event, false)} className="portal-panel space-y-4">
                    <h2 className="desk-section">Download a package</h2>
                    <label className="block">Format
                        <select className={control} value={format} disabled={busy} onChange={(e) => setFormat(e.target.value as Format)}>
                            <option value="native">Adin course backup</option><option value="scorm">SCORM 1.2 text assets</option>
                        </select>
                    </label>
                    <p>{format === 'native' ? 'Current lessons and attachments, course forums, assignment briefs and reference files, exam definitions and course question banks. Assessment archives contain private answer keys; you need exchange permission and teaching authority for the selected offering.' : 'Unscheduled text chapters only. A chapter with linked or attached material cannot be exported in this format.'}</p>
                    <button className={button} disabled={!valid || busy}>Download package</button>
                </form>
                <form onSubmit={(event) => transfer(event, true)} className="portal-panel desk-shelf space-y-4">
                    <h2 className="desk-section">Restore to a draft</h2>
                    <p>Choose an empty draft with no enrolments, lessons, forums, classes or gradebook. Nothing is overwritten.</p>
                    <input type="hidden" name="_token" value={csrf} />
                    <label className="block">Package (up to {(uploadLimit / 1048576).toFixed(1)} MiB)
                        <input className={`${control} text-sm`} required type="file" accept=".zip,.imscc" name="package" />
                    </label>
                    <button className={button} disabled={!valid || busy || (!!match && match.status !== 'draft')}>Restore package</button>
                </form>
            </div>
            <div role="status">{busy ? 'Transferring package…' : message}</div>
            {error && <p role="alert" className="rounded border border-red-700 p-3">{error}</p>}
            <section className="space-y-2 border-t border-slate-300 pt-4">
                <h2 className="desk-section">Compatibility limits</h2>
                <p>Native backups support 50 unscheduled lessons, 20 unrestricted materials per lesson and 50 forums. Files are limited to 4 MiB each, 50 files and 8 MiB expanded in total. Legacy Adin chapter ZIPs are also accepted.</p>
                <p>Assessment schedules retain their original UTC dates. Review them before opening the draft. All banks in the source curriculum course are included; their topics must be new in the destination course. Fixed questions and random draws retain their links. Custom exam security, custom activity order, class meetings and announcements block export.</p>
                <p>Common Cartridge 1.1 import maps a single root folder of local plain-text web resources to ordered chapters. Moodle .mbz backups, quizzes and nested sections are unsupported.</p>
                <p>SCORM 1.2 static text assets become chapters. Executable SCOs are blocked: there is no isolated player or SCORM completion, score or progress tracking.</p>
            </section>
        </main>
    );
}
