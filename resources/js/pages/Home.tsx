import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home() {
    const { signedIn, branding } = usePage<{ signedIn: boolean; branding: { institution: string; logoFull: string } }>().props;
    return (
        <main className="mx-auto grid w-full max-w-xl gap-6 px-4 py-8 sm:px-6 sm:py-12">
            <Head title="Learning portal" />
            <div className="space-y-2">
                <img className="mb-6 h-12 w-auto" src={branding.logoFull} alt={branding.institution} />
                <p className="text-sm font-medium text-muted-foreground">Academic workspace</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Learning portal</h1>
                <p>Open your course materials, attend scheduled classes and return to your assessments.</p>
                <Button asChild className="mt-5">
                    <Link href={signedIn ? '/dashboard' : '/login'}>
                        {signedIn ? 'Open dashboard' : 'Sign in to the portal'}
                    </Link>
                </Button>
            </div>
            <aside className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                <h2 className="text-xl font-semibold tracking-tight">Course registration</h2>
                <p>
                    Registration is managed through the institution’s registration platform. Your registered courses
                    appear here after the roster is updated.
                </p>
            </aside>
        </main>
    );
}
