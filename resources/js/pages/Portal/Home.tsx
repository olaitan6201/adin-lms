import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function Home() {
    const { signedIn, branding } = usePage<{ signedIn: boolean; branding: { institution: string; logoFull: string } }>().props;
    return (
        <div>
            <Head title="Learning portal" />
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Academic workspace</p>
                    <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[26px]">Learning portal</h1>
                    <p className="card-subtitle mt-1.5">Open your course materials, attend scheduled classes and return to your assessments.</p>
                </div>
                <Button asChild className="btn btn-primary">
                    <Link href={signedIn ? '/dashboard' : '/login'}>
                        {signedIn ? 'Open dashboard' : 'Sign in to the portal'}
                        <ArrowRight aria-hidden="true" />
                    </Link>
                </Button>
            </header>
            <section className="card max-w-3xl">
                <div className="card-head">
                    <div className="flex items-center gap-2">
                        <BookOpen aria-hidden="true" className="size-4 text-brand-700" />
                        <h2 className="card-title">Course registration</h2>
                    </div>
                </div>
                <div className="card-pad">
                    <img className="mb-4 h-10 max-w-full object-contain" src={branding.logoFull} alt={branding.institution} />
                    <p className="text-[13.5px] leading-relaxed text-ink-600">
                    Registration is managed through the institution’s registration platform. Your registered courses
                    appear here after the roster is updated.
                    </p>
                </div>
            </section>
        </div>
    );
}
