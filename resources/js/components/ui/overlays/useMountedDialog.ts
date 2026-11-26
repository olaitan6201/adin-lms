import { useLayoutEffect, useRef } from 'react';

/** Close before React removes the element so the browser restores its opener. */
export function useMountedDialog() {
    const ref = useRef<HTMLDialogElement>(null);

    useLayoutEffect(() => {
        const dialog = ref.current;
        dialog?.showModal();

        return () => dialog?.close();
    }, []);

    return ref;
}
