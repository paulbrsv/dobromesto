import path from 'path';
import fs from 'fs';

const dataDirectory = path.join(__dirname, '..', 'data');
const databaseFile = process.env.DB_PATH || path.join(dataDirectory, 'app.sqlite3');

export const paths = {
  dataDirectory,
  databaseFile,
  migrations: path.join(__dirname, 'migrations'),
};

export function ensureDataDirectory(): void {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }
}
