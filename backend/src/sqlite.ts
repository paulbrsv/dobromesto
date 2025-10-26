import { execFile } from 'child_process';
import { paths, ensureDataDirectory } from './config';

type ExecResult = { stdout: string; stderr: string };

type ExecOptions = {
  transactional?: boolean;
};

function ensureTerminated(statement: string): string {
  const trimmed = statement.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
}

function runSql(sql: string, args: string[] = []): Promise<ExecResult> {
  ensureDataDirectory();
  return new Promise((resolve, reject) => {
    const child = execFile('sqlite3', [...args, paths.databaseFile], (error, stdout, stderr) => {
      if (error) {
        const message = stderr || stdout || error.message;
        reject(new Error(message));
        return;
      }
      resolve({ stdout, stderr });
    });

    child.stdin?.end(sql);
  });
}

export async function executeStatements(statements: string[], options: ExecOptions = {}): Promise<void> {
  const body = statements
    .map(ensureTerminated)
    .filter((statement) => statement.length > 0)
    .join('\n');

  const commands: string[] = ['PRAGMA foreign_keys = ON;'];

  if (options.transactional !== false) {
    commands.push('BEGIN;');
  }

  if (body) {
    commands.push(body);
  }

  if (options.transactional !== false) {
    commands.push('COMMIT;');
  }

  await runSql(commands.join('\n') + '\n');
}

export async function queryAll<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
): Promise<T[]> {
  const { stdout } = await runSql(`PRAGMA foreign_keys = ON;\n${ensureTerminated(sql)}\n`, ['-json']);
  const trimmed = stdout.trim();
  if (!trimmed) {
    return [];
  }

  return JSON.parse(trimmed) as T[];
}
