const Redis = require('ioredis');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Connect to Redis
   */
  async connect() {
    try {
      // Priority 1: Check for direct connection string (e.g., Upstash rediss://)
      const redisUrl = process.env.REDIS_URL;

      let config;

      if (redisUrl) {
        // Direct connection using URL (supports rediss:// for Upstash)
        config = redisUrl;
      } else {
        // Fallback to host/port configuration
        config = {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB, 10) || 0,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          enableReadyCheck: false,
          enableOfflineQueue: true,
          maxRetriesPerRequest: null,
          tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        };
      }

      this.client = new Redis(config);

      // Error handling
      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        logger.info('Redis client connected and ready');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis client reconnecting...');
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      // Wait for connection
      await this.client.ping();
      this.isConnected = true;

      return this.client;
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  /**
   * Get value by key
   */
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set key-value pair
   */
  async set(key, value, ttl = null) {
    try {
      if (ttl) {
        return await this.client.set(key, value, 'EX', ttl);
      }
      return await this.client.set(key, value);
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set key-value with expiration
   */
  async setex(key, seconds, value) {
    try {
      return await this.client.setex(key, seconds, value);
    } catch (error) {
      logger.error(`Redis SETEX error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete key
   */
  async del(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment value
   */
  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Decrement value
   */
  async decr(key) {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`Redis DECR error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get keys by pattern
   */
  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Hash operations
   */
  async hset(key, field, value) {
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      logger.error(`Redis HSET error:`, error);
      throw error;
    }
  }

  async hget(key, field) {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error(`Redis HGET error:`, error);
      throw error;
    }
  }

  async hgetall(key) {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.error(`Redis HGETALL error:`, error);
      throw error;
    }
  }

  /**
   * Flush database (use with caution!)
   */
  async flushdb() {
    try {
      return await this.client.flushdb();
    } catch (error) {
      logger.error('Redis FLUSHDB error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis client disconnected');
      this.isConnected = false;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const pong = await this.client.ping();
      if (pong === 'PONG') {
        return { status: 'healthy', message: 'Redis is responding' };
      }
      return { status: 'unhealthy', message: 'Redis ping failed' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

// Export singleton instance
module.exports = new RedisClient();
