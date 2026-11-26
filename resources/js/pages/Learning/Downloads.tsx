import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { Button } from '@/components/ui/button';
import { InsightPanel } from '@/components/overview/InsightPanel';

type Material = { id: string; title: string; course: string; filename: string; bytes: number; download: string };

function fileSize(bytes: number) {
    if (bytes < 1000) return `${bytes} B`;
    return bytes < 1_000_000 ? `${(bytes / 1000).toFixed(1)} kB` : `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export default function Downloads({ materials }: { materials: Material[] }) {
    return (
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <Head title="Course downloads" />
            <DeskHeading area="Learning" title="Course downloads">
                Download published materials from your registered courses while you’re online.
            </DeskHeading>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <InsightPanel
                    title="Available to download"
                    subtitle={`${materials.length} ${materials.length === 1 ? 'file' : 'files'}`}
                >
                    {materials.length === 0 ? (
                        <p className="text-sm text-ink-600">No course files are available to download right now.</p>
                    ) : (
                        <ul className="divide-y divide-ink-100">
                            {materials.map((file) => (
                                <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                    <div className="min-w-0 flex-1 basis-48 break-words">
                                        <p className="text-xs text-ink-600">{file.course}</p>
                                        <h3 className="my-1 text-sm font-semibold text-ink-900">{file.title}</h3>
                                        <p className="text-xs text-ink-600">
                                            {file.filename} · {fileSize(file.bytes)}
                                        </p>
                                    </div>
                                    <Button asChild variant="outline">
                                        <a
                                            href={file.download}
                                            aria-label={`Download ${file.filename} for ${file.course}`}
                                        >
                                            <Download aria-hidden="true" /> Download
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </InsightPanel>
                <InsightPanel title="After downloading">
                    <p className="text-sm leading-relaxed text-ink-600">
                        Open your browser’s downloads to find a saved file. If your lecturer replaces it, download the
                        new version here. Copies on your device do not update automatically.
                    </p>
                </InsightPanel>
            </div>
        </main>
    );
}
