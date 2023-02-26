export function getErrorStackCallerPaths() {
  const filePaths: string[] = [];
  const stack = new Error().stack;
  if (stack) {
    const stackLines = stack.split('\n');
    for (const stackLine of stackLines) {
      const matches = stackLine.match(/^[^\/]+([^\:]+)\:/);
      if (matches) {
        filePaths.push(matches[1]);
      }
    }
  }

  return filePaths;
}
