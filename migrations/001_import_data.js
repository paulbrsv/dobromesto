#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
let dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'storage/app.sqlite');
let reset = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--db' || arg === '--database') {
    const next = args[i + 1];
    if (!next) {
      console.error('Missing value for --db option');
      process.exit(1);
    }
    dbPath = path.resolve(process.cwd(), next);
    i += 1;
  } else if (arg === '--reset') {
    reset = true;
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`Usage: node migrations/001_import_data.js [--db <path>] [--reset]\n` +
    'Reads JSON files from public/data and populates the SQLite database.\n' +
    'Options:\n' +
    '  --db <path>   Override the database path (default: storage/app.sqlite)\n' +
    '  --reset       Truncate existing data before inserting new rows');
}

const sqliteExecutable = 'sqlite3';
const sqliteVersion = spawnSync(sqliteExecutable, ['--version'], { encoding: 'utf8' });
if (sqliteVersion.status !== 0) {
  console.error('sqlite3 CLI is required but was not found in PATH.');
  process.exit(1);
}

const storageDir = path.dirname(dbPath);
if (storageDir) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const dataDir = path.resolve(process.cwd(), 'public/data');
const placesPath = path.join(dataDir, 'places.json');
const magnoliaPath = path.join(dataDir, 'magnolia.json');

if (!fs.existsSync(placesPath)) {
  console.error(`Could not find ${placesPath}`);
  process.exit(1);
}

if (!fs.existsSync(magnoliaPath)) {
  console.error(`Could not find ${magnoliaPath}`);
  process.exit(1);
}

const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
const magnolia = JSON.parse(fs.readFileSync(magnoliaPath, 'utf8'));

const statements = [];
statements.push('PRAGMA foreign_keys = ON;');
statements.push(`CREATE TABLE IF NOT EXISTS places (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  lat REAL NOT NULL,\n  lng REAL NOT NULL,\n  short_description TEXT,\n  description TEXT,\n  link TEXT,\n  instagram TEXT,\n  maps_url TEXT,\n  image TEXT\n);`);
statements.push(`CREATE TABLE IF NOT EXISTS place_attributes (\n  place_id INTEGER NOT NULL,\n  attribute TEXT NOT NULL,\n  FOREIGN KEY(place_id) REFERENCES places(id) ON DELETE CASCADE\n);`);
statements.push(`CREATE TABLE IF NOT EXISTS magnolia_points (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  external_id TEXT NOT NULL,\n  lat REAL NOT NULL,\n  lng REAL NOT NULL\n);`);

if (reset) {
  statements.push('DELETE FROM place_attributes;');
  statements.push('DELETE FROM places;');
  statements.push('DELETE FROM magnolia_points;');
}

statements.push('BEGIN TRANSACTION;');

for (const place of places) {
  const escaped = {
    name: escapeSql(place.name),
    lat: Number(place.lat),
    lng: Number(place.lng),
    short_description: escapeSql(place.shirt_description || place.short_description || ''),
    description: escapeSql(place.description || ''),
    link: escapeSql(place.link || ''),
    instagram: escapeSql(place.instagram || ''),
    maps_url: escapeSql(place.maps_url || ''),
    image: escapeSql(place.image || ''),
  };

  statements.push(`INSERT INTO places (name, lat, lng, short_description, description, link, instagram, maps_url, image) VALUES ('${escaped.name}', ${escaped.lat}, ${escaped.lng}, '${escaped.short_description}', '${escaped.description}', '${escaped.link}', '${escaped.instagram}', '${escaped.maps_url}', '${escaped.image}');`);

  if (Array.isArray(place.attributes)) {
    const placeIdLookup = '(SELECT id FROM places ORDER BY id DESC LIMIT 1)';
    for (const attribute of place.attributes) {
      statements.push(`INSERT INTO place_attributes (place_id, attribute) VALUES (${placeIdLookup}, '${escapeSql(attribute)}');`);
    }
  }
}

if (magnolia && typeof magnolia === 'object') {
  for (const [identifier, coordinates] of Object.entries(magnolia)) {
    const [latString, lngString] = String(coordinates).split(',').map((value) => value.trim());
    const lat = Number(latString);
    const lng = Number(lngString);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      statements.push(`INSERT INTO magnolia_points (external_id, lat, lng) VALUES ('${escapeSql(identifier)}', ${lat}, ${lng});`);
    }
  }
}

statements.push('COMMIT;');

const sqlPayload = statements.join('\n');
const result = spawnSync(sqliteExecutable, [dbPath], {
  input: sqlPayload,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

if (result.status !== 0) {
  console.error('Failed to execute migration script.');
  if (result.stderr) {
    console.error(result.stderr.trim());
  }
  process.exit(result.status || 1);
}

if (result.stderr) {
  console.error(result.stderr.trim());
}

console.log(`Migration completed successfully using ${dbPath}`);

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

