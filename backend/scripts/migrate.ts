import { ensureDataDirectory } from '../src/config';
import { executeStatements, queryAll } from '../src/sqlite';
import { migrations } from '../src/migrations';

type AppliedMigration = { id: string };

async function migrate() {
  ensureDataDirectory();

  await executeStatements([
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ], { transactional: false });

  const appliedRows = await queryAll<AppliedMigration>('SELECT id FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.id));

  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      continue;
    }

    await executeStatements([
      ...migration.statements,
      `INSERT INTO schema_migrations (id) VALUES ('${migration.id}')`,
    ]);

    console.log(`Applied migration ${migration.id}`);
  }

  console.log('Migrations completed successfully.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
