import type { AnswerValue } from './Answer';

export async function saveAnswer(url: string, value: AnswerValue, revision: number): Promise<{ revision: number }> {
    const token = decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': token,
        },
        body: JSON.stringify({ answer: value, revision }),
    });
    if (!response.ok)
        throw new Error(
            response.status === 409
                ? 'Paper changed or closed. Copy your draft before reloading.'
                : response.status === 422
                  ? 'Check the matching selections; each option can be used once.'
                  : 'Save failed. Retry before submitting.',
        );

    return (await response.json()) as { revision: number };
}
