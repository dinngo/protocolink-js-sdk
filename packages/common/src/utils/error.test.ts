import { expect } from 'chai';
import { getErrorStackCallerPaths } from './error';
import path from 'path';

it('Test getErrorStackCallerPaths', function () {
  const callerPaths = getErrorStackCallerPaths();
  expect(path.basename(callerPaths[0])).to.eq('error.ts');
  expect(path.basename(callerPaths[1])).to.eq('error.test.ts');
  expect(path.basename(path.resolve(callerPaths[0], '..'))).to.eq('utils');
  expect(path.basename(path.resolve(callerPaths[0], '..', '..'))).to.eq('src');
});
