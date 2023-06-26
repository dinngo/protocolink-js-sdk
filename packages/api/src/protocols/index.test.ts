import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

it('Test exports', async function () {
  const cwd = process.cwd();
  const protocols = fs
    .readdirSync(path.join(cwd, 'src', 'protocols'), { withFileTypes: true })
    .reduce((accumulator, dir) => {
      if (dir.isDirectory()) accumulator.push(dir.name);
      return accumulator;
    }, [] as string[]);

  const exports = await import('./index');
  expect(Object.keys(exports)).to.include.members(protocols.map((protocol) => protocol.replace(/-/g, '')));
});
