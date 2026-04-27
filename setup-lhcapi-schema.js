#!/usr/bin/env node
/**
 * Clone one Postgres schema into another for isolated testing.
 * Defaults: public -> lhcAPI
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function quoteIdent(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

async function setupLhcAPISchema() {
  const sourceSchema = process.env.SOURCE_SCHEMA || 'public';
  const targetSchema = process.env.TARGET_SCHEMA || 'lhcAPI';

  console.log(`\n🚀 Cloning schema ${sourceSchema} -> ${targetSchema}\n`);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) Ensure target schema exists.
    console.log(`1️⃣  Ensuring schema ${targetSchema} exists...`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(targetSchema)}`);
    console.log('✅ Target schema ready\n');

    // 2) Read tables from source schema.
    console.log(`2️⃣  Reading table list from ${sourceSchema}...`);
    const tablesResult = await client.query(`
      SELECT tablename AS table_name
      FROM pg_catalog.pg_tables
      WHERE schemaname = $1
      ORDER BY tablename
    `, [sourceSchema]);
    const tables = tablesResult.rows.map((row) => row.table_name);
    console.log(`✅ Found ${tables.length} table(s)\n`);

    // Nothing to clone is still a successful setup.
    if (tables.length === 0) {
      console.log(`⚠️  No tables found in ${sourceSchema}; nothing to copy.\n`);
      await client.query('COMMIT');
      return;
    }

    // 3) Recreate tables in target schema using exact structure (incl. defaults/indexes/constraints).
    console.log(`3️⃣  Recreating table structures in ${targetSchema}...`);
    for (const table of tables) {
      const sourceRef = `${quoteIdent(sourceSchema)}.${quoteIdent(table)}`;
      const targetRef = `${quoteIdent(targetSchema)}.${quoteIdent(table)}`;

      await client.query(`DROP TABLE IF EXISTS ${targetRef} CASCADE`);
      await client.query(`CREATE TABLE ${targetRef} (LIKE ${sourceRef} INCLUDING ALL)`);
      console.log(`  ✅ ${table}`);
    }
    console.log('');

    // 4) Copy rows table-by-table.
    console.log(`4️⃣  Copying data from ${sourceSchema} -> ${targetSchema}...`);
    let copiedRows = 0;
    for (const table of tables) {
      const sourceRef = `${quoteIdent(sourceSchema)}.${quoteIdent(table)}`;
      const targetRef = `${quoteIdent(targetSchema)}.${quoteIdent(table)}`;

      const insertResult = await client.query(`
        INSERT INTO ${targetRef}
        SELECT * FROM ${sourceRef}
      `);
      copiedRows += insertResult.rowCount;
      console.log(`  ✅ ${table}: ${insertResult.rowCount} row(s)`);
    }
    console.log('');

    // 5) Sync sequences so next inserts continue from current max values.
    console.log('5️⃣  Syncing sequence values...');
    const serialCols = await client.query(`
      SELECT
        c.table_name,
        c.column_name
      FROM information_schema.columns c
      WHERE c.table_schema = $1
        AND c.column_default LIKE 'nextval(%'
      ORDER BY c.table_name, c.ordinal_position
    `, [targetSchema]);

    for (const row of serialCols.rows) {
      const tableRef = `${quoteIdent(targetSchema)}.${quoteIdent(row.table_name)}`;
      const colIdent = quoteIdent(row.column_name);
      await client.query(`
        SELECT setval(
          pg_get_serial_sequence($1, $2),
          COALESCE((SELECT MAX(${colIdent})::bigint FROM ${tableRef}), 1),
          (SELECT EXISTS(SELECT 1 FROM ${tableRef}))
        )
      `, [`${targetSchema}.${row.table_name}`, row.column_name]);
    }
    console.log(`✅ Synced ${serialCols.rowCount} serial column sequence(s)\n`);

    // 6) Validate source vs target counts.
    console.log('6️⃣  Verifying counts...\n');
    let mismatches = 0;
    for (const table of tables) {
      const sourceRef = `${quoteIdent(sourceSchema)}.${quoteIdent(table)}`;
      const targetRef = `${quoteIdent(targetSchema)}.${quoteIdent(table)}`;
      const sourceCount = await client.query(`SELECT COUNT(*)::bigint AS count FROM ${sourceRef}`);
      const targetCount = await client.query(`SELECT COUNT(*)::bigint AS count FROM ${targetRef}`);
      const src = Number(sourceCount.rows[0].count);
      const dst = Number(targetCount.rows[0].count);
      const same = src === dst;
      if (!same) mismatches += 1;
      console.log(`📊 ${table}: ${src} -> ${dst} ${same ? '✅' : '❌'}`);
    }

    await client.query('COMMIT');
    console.log('');
    console.log('✨ Schema clone completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - Source schema: ${sourceSchema}`);
    console.log(`   - Target schema: ${targetSchema}`);
    console.log(`   - Tables cloned: ${tables.length}`);
    console.log(`   - Total rows copied: ${copiedRows}`);
    console.log(`   - Count mismatches: ${mismatches}\n`);
    console.log('✅ lhcAPI is ready for isolated testing.\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error setting up lhcAPI schema:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

// Run the setup
setupLhcAPISchema();
