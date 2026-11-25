import { NativeSelectOption } from '@/components/ui/native-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { useCourseTransfer, type Format } from '../components/useCourseTransfer';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type Offering = {
    id: string;
    external_offering_id: string | null;
    status: string;
};
type Props = {
    csrf: string;
    offerings: Offering[];
    uploadLimit: number;
};

export default function CourseExchange({ csrf, offerings, uploadLimit }: Props) {
    const [offering, setOffering] = useState('');
    const [format, setFormat] = useState<Format>('native');
    const match = offerings.find((item) => item.id === offering);
    const valid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(offering);
    const { busy, error, message, transfer, clearFeedback } = useCourseTransfer(
        offering,
        format,
        valid,
        match?.external_offering_id ?? offering,
    );

    return (
        <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
            <Head title="Course exchange" />
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">Teaching administration</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Course exchange</h1>
                <p>Move teaching content between offerings. Enrolments, posts, submissions and grades stay behind.</p>
            </header>
            <div>
                <Label className="block font-semibold" htmlFor="exchange-offering">
                    Offering
                </Label>
                <Input
                    id="exchange-offering"
                    list="exchange-offerings"
                    value={offering}
                    disabled={busy}
                    placeholder="Choose a recent offering or paste its UUID"
                    onChange={(event) => {
                        setOffering(event.target.value.trim());
                        clearFeedback();
                    }}
                />
                <datalist id="exchange-offerings">
                    {offerings.map((item) => (
                        <NativeSelectOption key={item.id} value={item.id}>
                            {item.external_offering_id ?? item.id} · {item.status}
                        </NativeSelectOption>
                    ))}
                </datalist>
            </div>
            <p>
                {match
                    ? `${match.external_offering_id ?? match.id} · ${match.status}`
                    : offering && !valid
                      ? 'Enter a complete offering UUID.'
                      : 'Choose the source for a download or the destination for a restore.'}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
                <Card><CardContent><form onSubmit={(event) => transfer(event, false)} className="min-w-0 space-y-4">
                    <h2 className="text-xl font-semibold">Download a package</h2>
                    <Label className="grid gap-2">
                        Format
                        <NativeSelect
                            value={format}
                            disabled={busy}
                            onChange={(e) => setFormat(e.target.value as Format)}
                        >
                            <NativeSelectOption value="native">Adin course backup</NativeSelectOption>
                            <NativeSelectOption value="scorm">SCORM 1.2 text assets</NativeSelectOption>
                        </NativeSelect>
                    </Label>
                    <p>
                        {format === 'native'
                            ? 'Current lessons and attachments, course forums, assignment briefs and reference files, exam definitions and course question banks. Assessment archives contain private answer keys; you need exchange permission and teaching authority for the selected offering.'
                            : 'Unscheduled text chapters only. A chapter with linked or attached material cannot be exported in this format.'}
                    </p>
                    <Button disabled={!valid || busy}>
                        Download package
                    </Button>
                </form></CardContent></Card>
                <Card><CardContent><form onSubmit={(event) => transfer(event, true)} className="min-w-0 space-y-4">
                    <h2 className="text-xl font-semibold">Restore to a draft</h2>
                    <p>
                        Choose an empty draft with no enrolments, lessons, forums, classes or gradebook. Nothing is
                        overwritten.
                    </p>
                    <input type="hidden" name="_token" value={csrf} />
                    <Label className="grid gap-2">
                        Package (up to {(uploadLimit / 1048576).toFixed(1)} MiB)
                        <Input
                            required
                            type="file"
                            accept=".zip,.imscc"
                            name="package"
                        />
                    </Label>
                    <Button disabled={!valid || busy || (!!match && match.status !== 'draft')}>
                        Restore package
                    </Button>
                </form></CardContent></Card>
            </div>
            <div role="status">{busy ? 'Transferring package…' : message}</div>
            {error && (
                <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
            )}
            <section className="space-y-2 border-t border-border pt-4">
                <h2 className="text-xl font-semibold">Compatibility limits</h2>
                <p>
                    Native backups support 50 unscheduled lessons, 20 unrestricted materials per lesson and 50 forums.
                    Files are limited to 4 MiB each, 50 files and 8 MiB expanded in total. Legacy Adin chapter ZIPs are
                    also accepted.
                </p>
                <p>
                    Assessment schedules retain their original UTC dates. Review them before opening the draft. All
                    banks in the source curriculum course are included; their topics must be new in the destination
                    course. Fixed questions and random draws retain their links. Custom exam security, custom activity
                    order, class meetings and announcements block export.
                </p>
                <p>
                    Common Cartridge 1.1 import maps a single root folder of local plain-text web resources to ordered
                    chapters. Cartridge quizzes and nested sections are unsupported. Moodle .mbz backups cannot be
                    restored here; export supported text resources from the source course instead.
                </p>
                <p>
                    SCORM 1.2 text assets become ordinary chapters. This importer does not run package code or transfer
                    learner progress. For a supported Reading v1 package, use the separate course reading player when
                    enabled. Its completion score does not enter the gradebook.
                </p>
            </section>
        </main>
    );
}
