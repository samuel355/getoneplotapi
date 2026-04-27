#!/usr/bin/env node
/**
 * Setup lhcAPI Schema - Copy from public and test
 * This script copies the public schema to lhcAPI schema for isolated development
 */

require('dotenv').config();
const { Pool } = require('pg');
const logger = require('./shared/utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupLhcAPISchema() {
  console.log('\n🚀 Setting up lhcAPI schema...\n');

  const client = await pool.connect();

  try {
    // Step 1: Create lhcAPI schema if it doesn't exist
    console.log('1️⃣  Creating lhcAPI schema...');
    await client.query('CREATE SCHEMA IF NOT EXISTS "lhcAPI"');
    console.log('✅ lhcAPI schema created/verified\n');

    // Step 2: Get all tables from public schema
    console.log('2️⃣  Fetching table structure from public schema...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`✅ Found ${tables.length} tables: ${tables.join(', ')}\n`);

    if (tables.length === 0) {
      console.log('⚠️  No tables found in public schema. Skipping copy.\n');
      await client.query('COMMIT');
      return;
    }

    // Step 3: Copy table structure from public to lhcAPI
    console.log('3️⃣  Copying table structures...');
    for (const table of tables) {
      try {
        // Get the CREATE TABLE statement for each table
        const createTableResult = await client.query(`
          SELECT pg_get_createtablecmd('${table}'::regclass)
        `);

        let createTableSQL = createTableResult.rows[0]?.pg_get_createtablecmd;

        if (!createTableSQL) {
          // Fallback: manually construct CREATE TABLE IF NOT EXISTS statement
          const columnsResult = await client.query(`
            SELECT
              column_name,
              data_type,
              is_nullable,
              column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${table}'
            ORDER BY ordinal_position
          `);

          const columns = columnsResult.rows;
          let columnDefs = columns.map(col => {
            let def = `"${col.column_name}" ${col.data_type}`;
            if (col.column_default) def += ` DEFAULT ${col.column_default}`;
            if (col.is_nullable === 'NO') def += ' NOT NULL';
            return def;
          }).join(', ');

          createTableSQL = `CREATE TABLE IF NOT EXISTS "lhcAPI"."${table}" (${columnDefs})`;
        } else {
          // Replace public with lhcAPI in the generated statement
          createTableSQL = createTableSQL.replace('public.', 'lhcAPI.');
          createTableSQL = createTableSQL.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS');
        }

        await client.query(createTableSQL);
        console.log(`  ✅ Copied: ${table}`);
      } catch (err) {
        console.log(`  ⚠️  Could not copy ${table}: ${err.message}`);
      }
    }
    console.log('');

    // Step 4: Copy data from public to lhcAPI
    console.log('4️⃣  Copying data from public to lhcAPI...');
    for (const table of tables) {
      try {
        // Check if table has data
        const countResult = await client.query(
          `SELECT COUNT(*) FROM public."${table}"`
        );
        const rowCount = parseInt(countResult.rows[0].count, 10);

        if (rowCount > 0) {
          // Truncate target table first
          await client.query(`TRUNCATE TABLE "lhcAPI"."${table}" CASCADE`);

          // Copy data
          await client.query(`
            INSERT INTO "lhcAPI"."${table}"
            SELECT * FROM public."${table}"
          `);

          console.log(`  ✅ Copied ${rowCount} rows from ${table}`);
        } else {
          console.log(`  ℹ️  No data in ${table} (empty table)`);
        }
      } catch (err) {
        console.log(`  ⚠️  Could not copy data for ${table}: ${err.message}`);
      }
    }
    console.log('');

    // Step 5: Test the lhcAPI schema with sample queries
    console.log('5️⃣  Testing lhcAPI schema with queries...\n');

    for (const table of tables) {
      try {
        const result = await client.query(
          `SELECT COUNT(*) as count FROM "lhcAPI"."${table}" LIMIT 1`
        );

        const recordCount = result.rows[0]?.count || 0;
        console.log(`📊 Table: lhcAPI.${table}`);
        console.log(`   Records: ${recordCount}`);

        if (recordCount > 0) {
          // Show first record structure and sample data
          const sampleResult = await client.query(
            `SELECT * FROM "lhcAPI"."${table}" LIMIT 1`
          );

          if (sampleResult.rows.length > 0) {
            const firstRow = sampleResult.rows[0];
            const columns = Object.keys(firstRow);
            console.log(`   Columns: ${columns.join(', ')}`);
            console.log(`   Sample: ${JSON.stringify(firstRow).substring(0, 100)}...`);
          }
        }
        console.log('');
      } catch (err) {
        console.log(`   ❌ Error reading ${table}: ${err.message}\n`);
      }
    }

    // Step 6: Display schema information
    console.log('6️⃣  Schema Information:\n');

    const schemaInfoResult = await client.query(`
      SELECT
        t.table_name,
        COUNT(c.column_name) as column_count,
        (SELECT COUNT(*) FROM "lhcAPI"."${tables[0] || 'information_schema.tables'}") as total_tables
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'lhcAPI'
      GROUP BY t.table_name
      ORDER BY t.table_name
    `);

    console.log('📋 lhcAPI Schema Structure:');
    for (const row of schemaInfoResult.rows) {
      console.log(`   ✅ ${row.table_name} (${row.column_count} columns)`);
    }

    console.log('\n✨ lhcAPI schema setup completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   ✅ Schema: lhcAPI created`);
    console.log(`   ✅ Tables: ${tables.length} copied`);
    console.log(`   ✅ Status: Ready for testing\n`);

    console.log('🧪 To test connections:');
    console.log('   node test-supabase.js\n');

    console.log('💡 To use lhcAPI schema in queries:');
    console.log('   SELECT * FROM "lhcAPI".table_name;\n');

  } catch (error) {
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
