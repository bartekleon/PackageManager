import test from 'ava';

import { extractVersion } from '../src/getVersion';

test('extract minor ver', async (t) => {
  const minorDep = extractVersion('~1.0.0');

  t.assert(minorDep, '1.0');
});

test('extract major ver', async (t) => {
  const majorDep = extractVersion('^1.0.0');

  t.assert(majorDep, '1');
});

test('extract current ver', async (t) => {
  const currentDep = extractVersion('1.0.0');

  t.assert(currentDep, '1.0.0');
});
