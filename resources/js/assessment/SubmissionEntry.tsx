import { Form } from '@inertiajs/react';

interface Props {
    url: string;
    formats: string[];
    groupWork: boolean;
    groups: {id: string; name: string}[];
}

export function SubmissionEntry({url, formats, groupWork, groups}: Props) {
    return <section>
        <h2>Submit your work</h2>
        <Form action={url} method="post">
            {({processing, errors}) => <>
                {formats.includes('txt') && <label>Answer<textarea name="body" /></label>}
                <label>Attach submission
                    <input type="file" name="script" accept={formats.map(f => `.${f}`).join(',')} />
                </label>
                {groupWork && <label>Study group
                    <select name="group_id" required>
                        {groups.map(group => <option value={group.id} key={group.id}>{group.name}</option>)}
                    </select>
                </label>}
                {groupWork && !groups.length && <p>Ask your lecturer to assign you to a study group before submitting.</p>}
                <button disabled={processing || (groupWork && !groups.length)}>Submit revision</button>
                <p role="alert">{Object.values(errors).join(' ')}</p>
            </>}
        </Form>
    </section>;
}
