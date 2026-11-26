import { useState } from 'react';
import type { UploadGroup } from '@/types/registry/content';

const storageKey = 'adin.fixture.content.upload-policy.v1';
type Selection = Record<string, string[]>;

function defaults(groups: UploadGroup[]): Selection {
    return Object.fromEntries(groups.flatMap((group) => (group.extensions ? [[group.id, group.extensions]] : [])));
}

function readPolicy(groups: UploadGroup[]): Selection {
    const seed = defaults(groups);
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
        if (!stored || typeof stored !== 'object') return seed;

        return Object.fromEntries(
            Object.entries(seed).map(([id, supported]) => {
                const values = Object.getOwnPropertyDescriptor(stored, id)?.value;
                return [
                    id,
                    Array.isArray(values) ? supported.filter((extension) => values.includes(extension)) : supported,
                ];
            }),
        );
    } catch {
        return seed;
    }
}

export function useUploadPolicy(groups: UploadGroup[]) {
    const [selection, setSelection] = useState(() => readPolicy(groups));
    function save(data: FormData) {
        const next: Selection = {};
        for (const group of groups) {
            const supported = group.extensions;
            if (!supported) continue;

            const input = String(data.get(group.label) ?? '')
                .toLowerCase()
                .split(/[\s,]+/)
                .filter(Boolean)
                .map((ext) => ext.replace(/^\./, ''));
            const invalid = input.find((extension) => !supported.includes(extension));
            if (invalid !== undefined) return `${group.label}: ${invalid} is not a supported file type.`;

            next[group.id] = [...new Set(input)];
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            return 'The policy could not be saved in this browser.';
        }

        setSelection(next);
    }

    return { selection, allowed: Object.values(selection).flat(), save };
}
