import { revert, snapshot } from 'src/utils';

export function snapshotAndRevertOnce() {
  before(async function () {
    await snapshot();
  });

  after(async function () {
    await revert();
  });
}

export function snapshotAndRevertEach() {
  beforeEach(async function () {
    await snapshot();
  });

  afterEach(async function () {
    await revert();
  });
}
