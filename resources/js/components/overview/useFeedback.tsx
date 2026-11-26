import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons/Icon';

export function useFeedback() {
    const [notice, setNotice] = useState<{ text: string }>();
    useEffect(() => {
        if (!notice) return;

        const id = window.setTimeout(() => setNotice(undefined), 3800);
        return () => window.clearTimeout(id);
    }, [notice]);
    const feedback = (
        <div role="status" className="fixed bottom-5 right-5 z-50">
            {notice && (
                <div className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-[13px] text-brand-900 shadow-lift">
                    <Icon name="check" className="mt-0.5 size-4 shrink-0" />
                    {notice.text}
                </div>
            )}
        </div>
    );
    return { notify: (text: string) => setNotice({ text }), feedback };
}
