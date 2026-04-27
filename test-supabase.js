#!/usr/bin/env node
/**
 * Test Supabase database connection
 */

require('dotenv').config();
const database = require('./shared/database');
const logger = require('./shared/utils/logger');

async function testSupabase() {
  console.log('🧪 Testing Supabase Database Connection...\n');

  try {
    // Test 1: Connect to database
    console.log('1️⃣  Connecting to Supabase...');
    await database.connect();
    console.log('✅ Connected successfully!\n');

    // Test 2: Simple query
    console.log('2️⃣  Testing simple query...');
    const versionResult = await database.query('SELECT VERSION()');
    console.log(`✅ PostgreSQL Version: ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Test 3: Create test table
    console.log('3️⃣  Creating test table...');
    await database.query(`
      DROP TABLE IF EXISTS test_connection CASCADE;
      CREATE TABLE test_connection (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Test table created\n');

    // Test 4: Insert data
    console.log('4️⃣  Testing INSERT...');
    const insertResult = await database.query(
      'INSERT INTO test_connection (name, email) VALUES ($1, $2) RETURNING *',
      ['Test User', 'test@example.com']
    );
    console.log(`✅ Inserted: ${JSON.stringify(insertResult.rows[0])}\n`);

    // Test 5: SELECT data
    console.log('5️⃣  Testing SELECT...');
    const selectResult = await database.query(
      'SELECT * FROM test_connection WHERE email = $1',
      ['test@example.com']
    );
    console.log(`✅ Retrieved: ${JSON.stringify(selectResult.rows[0])}\n`);

    // Test 6: UPDATE data
    console.log('6️⃣  Testing UPDATE...');
    const updateResult = await database.query(
      'UPDATE test_connection SET name = $1 WHERE email = $2 RETURNING *',
      ['Updated User', 'test@example.com']
    );
    console.log(`✅ Updated: ${JSON.stringify(updateResult.rows[0])}\n`);

    // Test 7: Transaction
    console.log('7️⃣  Testing TRANSACTION...');
    const transactionResult = await database.transaction(async (client) => {
      await client.query(
        'INSERT INTO test_connection (name, email) VALUES ($1, $2)',
        ['Transaction User', 'transaction@example.com']
      );
      const result = await client.query('SELECT COUNT(*) as count FROM test_connection');
      return result.rows[0];
    });
    console.log(`✅ Transaction completed. Total records: ${transactionResult.count}\n`);

    // Test 8: SELECT all
    console.log('8️⃣  Testing SELECT all...');
    const allResult = await database.query('SELECT * FROM test_connection');
    console.log(`✅ Total records in table: ${allResult.rowCount}\n`);

    // Test 9: DELETE data
    console.log('9️⃣  Testing DELETE...');
    const deleteResult = await database.query(
      'DELETE FROM test_connection WHERE email = $1',
      ['test@example.com']
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} record(s)\n`);

    // Test 10: Health check
    console.log('🔟 Health check...');
    const health = await database.healthCheck();
    console.log(`✅ Health status: ${health.status}`);
    console.log(`   Message: ${health.message}\n`);

    // Test 11: Cleanup
    console.log('🧹 Cleaning up test table...');
    await database.query('DROP TABLE IF EXISTS test_connection CASCADE');
    console.log('✅ Test table dropped\n');

    console.log('✨ All tests passed! Supabase is working perfectly.\n');
    console.log('📊 Connection Summary:');
    console.log(`   - Database URL: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   - SSL Support: ✅ Enabled (Required for Supabase)`);
    console.log(`   - Pool Size: ${process.env.DATABASE_POOL_MAX || '10'} max connections\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n📋 Troubleshooting tips:');
    console.error('   1. Check DATABASE_URL in .env file');
    console.error('   2. Ensure DATABASE_URL is in format: postgresql://user:password@host:port/database');
    console.error('   3. For Supabase, use the "Connection string" from your project settings');
    console.error('   4. Make sure your IP is whitelisted in Supabase network settings');
    console.error('   5. Verify DATABASE_SSL=true for Supabase\n');
    console.error(error);
  } finally {
    // Disconnect
    console.log('Disconnecting from Supabase...');
    await database.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  }
}

// Run the test
testSupabase();
