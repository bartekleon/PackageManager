import test from 'ava';

import { getVersion } from '../src/getVersion';

test.failing('get latest package version', async (t) => {
  const version = await getVersion('steampe');

  t.assert(version, '2.1.7');
});

test('get certain package version', async (t) => {
  const version = await getVersion('npm', '6.14.4');

  t.assert(version, '6.14.4');
});
