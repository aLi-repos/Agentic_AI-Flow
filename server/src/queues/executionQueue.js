const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const env = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let executionQueue = null;
let executionWorker = null;
let useInMemoryQueue = false;

// In-memory queue storage for fallback
const inMemoryQueue = [];
let isProcessingInMemory = false;

const processInMemoryJob = async () => {
  if (isProcessingInMemory || inMemoryQueue.length === 0) return;
  isProcessingInMemory = true;

  while (inMemoryQueue.length > 0) {
    const job = inMemoryQueue.shift();
    try {
      console.log(`[Queue-Memory] Processing execution job ${job.data.executionId}...`);
      await orchestrator.run(job.data.executionId);
    } catch (err) {
      console.error(`[Queue-Memory] Job ${job.data.executionId} failed:`, err.message);
    }
  }

  isProcessingInMemory = false;
};

const initQueue = async () => {
  try {
    if (env.REDIS_URL && env.REDIS_URL !== 'memory') {
      // Upstash and other cloud Redis providers use rediss:// (TLS)
      const isTLS = env.REDIS_URL.startsWith('rediss://');
      const redisConnection = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 5000,
        retryStrategy: () => null, // Do not hang if Redis is not running
        ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
      });

      redisConnection.on('error', (err) => {
        if (!useInMemoryQueue) {
          console.warn('⚠️ [Redis] Redis connection failed, switching to In-Memory Queue fallback:', err.message);
          useInMemoryQueue = true;
        }
      });

      await new Promise((resolve, reject) => {
        redisConnection.once('connect', () => {
          console.log('✅ [Redis] Connected to Redis for BullMQ execution queue.');
          resolve();
        });
        redisConnection.once('error', () => {
          useInMemoryQueue = true;
          resolve();
        });
      });

      if (!useInMemoryQueue) {
        executionQueue = new Queue('workflow-executions', { connection: redisConnection });
        executionWorker = new Worker(
          'workflow-executions',
          async (job) => {
            console.log(`[BullMQ] Worker picked up execution job ${job.data.executionId}`);
            await orchestrator.run(job.data.executionId);
          },
          { connection: redisConnection }
        );

        executionWorker.on('failed', (job, err) => {
          console.error(`[BullMQ] Job ${job?.id} failed:`, err.message);
        });

        return { queue: executionQueue, type: 'bullmq-redis' };
      }
    }
  } catch (err) {
    console.warn('⚠️ [Queue] BullMQ Redis init error, defaulting to In-Memory Queue:', err.message);
    useInMemoryQueue = true;
  }

  console.log('🚀 [Queue] In-Memory Execution Queue initialized.');
  useInMemoryQueue = true;
  return { queue: null, type: 'in-memory' };
};

/**
 * Add execution to background queue
 */
const addExecutionJob = async (executionId, data = {}) => {
  if (!useInMemoryQueue && executionQueue) {
    try {
      const job = await executionQueue.add('execute_workflow', { executionId, ...data }, {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
      });
      return { jobId: job.id, type: 'redis' };
    } catch (err) {
      console.warn('[Queue] Redis enqueue error, routing to in-memory queue:', err.message);
    }
  }

  // In-Memory Enqueue
  inMemoryQueue.push({ data: { executionId, ...data } });
  // Trigger async worker without blocking HTTP response
  setTimeout(processInMemoryJob, 50);

  return { jobId: `mem_${Date.now()}`, type: 'in-memory' };
};

module.exports = {
  initQueue,
  addExecutionJob,
};
