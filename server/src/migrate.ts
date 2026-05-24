import './loadEnv.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getClient, closePool } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function migrate() {
  console.log('Starting database migrations...');
  const client = await getClient();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // Get executed migrations
    const { rows } = await client.query('SELECT name FROM migrations');
    const executedMigrations = new Set(rows.map(row => row.name));

    // Get available migrations
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (!executedMigrations.has(file)) {
        console.log(`Executing migration: ${file}...`);
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Migration ${file} executed successfully.`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`Failed to execute migration ${file}:`, err);
          throw err;
        }
      } else {
        console.log(`Skipping migration ${file} (already executed).`);
      }
    }
    
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await closePool();
  }
}

migrate();
