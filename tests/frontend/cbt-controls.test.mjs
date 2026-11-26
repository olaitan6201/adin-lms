import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectedBank } from '../../resources/js/components/assessments/cbt/bankAccess.ts';
import { windowError } from '../../resources/js/components/assessments/cbt/sittingWindow.ts';

test('direct bank selection resolves only known IDs allowed for the fixture role', () => {
    const banks = [{ id: 'open', security: 'open' }, { id: 'officers', security: 'restricted' }];
    assert.equal(selectedBank(banks, 'officers', false), undefined);
    assert.equal(selectedBank(banks, 'officers', true), banks[1]);
    assert.equal(selectedBank(banks, 'open', false), banks[0]);
    assert.equal(selectedBank(banks, 'unknown', true), undefined);
});

test('window validation rejects invalid dates including normalized overflows', () => {
    const opens = '2026-02-27T09:00';
    for (const closes of ['', 'not a date', '2026-02-30T09:00', '2026-02-27T24:00', opens, '2026-02-26T10:00']) {
        assert.ok(windowError({ opens, closes }));
    }
    assert.ok(windowError({ opens: 'invalid', closes: opens }));
    assert.equal(windowError({ opens, closes: '2026-02-27T09:01' }), '');
});
