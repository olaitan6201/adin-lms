import { NativeSelectOption } from '@/components/ui/native-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCourseTransfer, type Format } from '@/hooks/operations/useCourseTransfer';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CourseHeader } from '@/components/learning/CourseHeader';
import { ExchangeCompatibility } from '@/components/operations/exchange/ExchangeCompatibility';
import { DownloadPackage } from '@/components/operations/exchange/DownloadPackage';
import { RestorePackage } from '@/components/operations/exchange/RestorePackage';

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
        <main className="course-page">
            <Head title="Course exchange" />
            <CourseHeader
                eyebrow="Teaching administration"
                title="Course exchange"
                description={<p>Move teaching content between offerings. Enrolments, posts, submissions and grades stay behind.</p>}
            />
            <div className="course-panel course-pad">
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
                <p>
                    {match
                        ? `${match.external_offering_id ?? match.id} · ${match.status}`
                        : offering && !valid
                          ? 'Enter a complete offering UUID.'
                          : 'Choose the source for a download or the destination for a restore.'}
                </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                <DownloadPackage
                    format={format}
                    setFormat={setFormat}
                    busy={busy}
                    disabled={!valid || busy}
                    onSubmit={(event) => transfer(event, false)}
                />
                <RestorePackage
                    csrf={csrf}
                    uploadLimit={uploadLimit}
                    disabled={!valid || busy || (!!match && match.status !== 'draft')}
                    onSubmit={(event) => transfer(event, true)}
                />
            </div>
            <div role="status">{busy ? 'Transferring package…' : message}</div>
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <ExchangeCompatibility />
        </main>
    );
}
