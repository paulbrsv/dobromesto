#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const rootNodeModules = path.join(projectRoot, 'node_modules');
const keepReactDir = path.join(rootNodeModules, 'react');

if (!fs.existsSync(rootNodeModules)) {
  process.exit(0);
}

const removed = [];
const stack = [rootNodeModules];

const enqueueNested = (pkgDir) => {
  const nested = path.join(pkgDir, 'node_modules');
  if (fs.existsSync(nested)) {
    stack.push(nested);
  }
};

while (stack.length > 0) {
  const current = stack.pop();

  if (path.normalize(current) !== path.normalize(rootNodeModules)) {
    const reactDir = path.join(current, 'react');
    if (
      fs.existsSync(reactDir) &&
      path.normalize(reactDir) !== path.normalize(keepReactDir)
    ) {
      fs.rmSync(reactDir, { recursive: true, force: true });
      removed.push(reactDir);
    }
  }

  const entries = fs.readdirSync(current, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === '.bin') {
      continue;
    }

    const entryPath = path.join(current, entry.name);

    if (entry.name.startsWith('@')) {
      const scopedEntries = fs.readdirSync(entryPath, { withFileTypes: true });
      for (const scopedEntry of scopedEntries) {
        if (!scopedEntry.isDirectory()) {
          continue;
        }
        enqueueNested(path.join(entryPath, scopedEntry.name));
      }
    } else {
      enqueueNested(entryPath);
    }
  }
}

if (removed.length > 0) {
  console.log(`Removed duplicate React installs:\n${removed.join('\n')}`);
}
