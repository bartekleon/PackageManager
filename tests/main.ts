import test from 'ava';

import { Run as main } from '../src/main';

test('running package manager', async (t) => {
  await t.notThrowsAsync(main());
});
