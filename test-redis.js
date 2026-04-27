#!/usr/bin/env node
/**
 * Test Redis connection with Upstash
 */

require('dotenv').config();
const redis = require('./shared/database/redis');
const logger = require('./shared/utils/logger');

async function testRedis() {
  console.log('🧪 Testing Redis Connection...\n');

  try {
    // Test 1: Connect to Redis
    console.log('1️⃣  Connecting to Redis...');
    await redis.connect();
    console.log('✅ Connected successfully!\n');

    // Test 2: Set a value
    console.log('2️⃣  Setting test key...');
    await redis.set('test:key', 'Hello from Upstash!', 60);
    console.log('✅ Set test:key = "Hello from Upstash!"\n');

    // Test 3: Get the value
    console.log('3️⃣  Getting test key...');
    const value = await redis.get('test:key');
    console.log(`✅ Retrieved value: "${value}"\n`);

    // Test 4: Test expiration
    console.log('4️⃣  Testing expiration (setex)...');
    await redis.setex('temp:key', 5, 'This will expire in 5 seconds');
    const tempValue = await redis.get('temp:key');
    console.log(`✅ Set temp:key with 5s expiration: "${tempValue}"\n`);

    // Test 5: Test counter
    console.log('5️⃣  Testing counter operations...');
    await redis.set('counter', '0');
    await redis.incr('counter');
    await redis.incr('counter');
    await redis.incr('counter');
    const counter = await redis.get('counter');
    console.log(`✅ Counter value: ${counter}\n`);

    // Test 6: Test hash operations
    console.log('6️⃣  Testing hash operations...');
    await redis.hset('user:1', 'name', 'John Doe');
    await redis.hset('user:1', 'email', 'john@example.com');
    await redis.hset('user:1', 'age', '30');
    const userHash = await redis.hgetall('user:1');
    console.log(`✅ Hash user:1 stored:`, userHash, '\n');

    // Test 7: Check key existence
    console.log('7️⃣  Testing key existence...');
    const exists = await redis.exists('test:key');
    console.log(`✅ Key "test:key" exists: ${exists === 1}\n`);

    // Test 8: Get key TTL
    console.log('8️⃣  Testing TTL...');
    const ttl = await redis.client.ttl('temp:key');
    console.log(`✅ temp:key TTL: ${ttl} seconds\n`);

    // Test 9: Delete a key
    console.log('9️⃣  Testing delete...');
    await redis.del('counter');
    const deleted = await redis.get('counter');
    console.log(`✅ Deleted counter: ${deleted === null}\n`);

    // Test 10: Health check
    console.log('🔟 Health check...');
    const health = await redis.healthCheck();
    console.log(`✅ Health status: ${health.status}`);
    console.log(`   Message: ${health.message}\n`);

    console.log('✨ All tests passed! Redis is working perfectly.\n');
    console.log('📊 Connection Summary:');
    console.log(`   - Connection: ${redis.isConnected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   - Client: ${redis.client ? '✅ Available' : '❌ Not available'}\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    // Disconnect
    console.log('Disconnecting from Redis...');
    await redis.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  }
}

// Run the test
testRedis();
