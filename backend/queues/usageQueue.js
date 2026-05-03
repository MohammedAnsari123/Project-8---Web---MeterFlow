const { Queue, Worker } = require('bullmq');
const redisClient = require('../config/redis');
const UsageLog = require('../models/UsageLog');

// Create the queue
const usageQueue = new Queue('usage-logs', { connection: redisClient });

// Create the worker to process usage logs asynchronously
const usageWorker = new Worker('usage-logs', async (job) => {
  try {
    const logData = job.data;
    await UsageLog.create(logData);
  } catch (error) {
    console.error('Error saving usage log:', error);
    throw error; // Re-throw to let BullMQ know it failed
  }
}, { connection: redisClient });

usageWorker.on('failed', (job, err) => {
  console.error(`Usage job ${job.id} failed:`, err.message);
});

module.exports = { usageQueue };
