#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/run-with-env.js <env> <command> [args...]');
  process.exit(1);
}

const [envName, command, ...commandArgs] = args;
const envFile = path.resolve(process.cwd(), `.env.${envName}`);
if (!fs.existsSync(envFile)) {
  console.error(`Environment file ${envFile} does not exist.`);
  process.exit(1);
}

const envVariables = { ...process.env };
const fileContent = fs.readFileSync(envFile, 'utf8');
for (const line of fileContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    continue;
  }
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=').trim();
  envVariables[key] = value;
}

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: envVariables,
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
