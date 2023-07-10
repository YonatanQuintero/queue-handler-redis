const express = require('express');
const redis = require('redis');
const { Queue } = require('async-await-queue');

// Connect to Redis
const client = redis.createClient(6379, '127.0.0.1');

// Set queue
const queue = new Queue(50, 500);
const QUEUE_PRIORITY = -1;
const expiresIn = 60 * 5; // 5 minutes

/**
 * Function to simulate a long-running task
 * @param {string} taskId - The ID of the task
 * @param {number} duration - The duration of the task in milliseconds
 */
const simulateTask = async (taskId, duration) => {
    const startTime = new Date();
    await client.set(`task:${taskId}:status`, 'running', { EX: expiresIn });
    await client.set(`task:${taskId}:message`, '', { EX: expiresIn });
    console.log(`[${new Date().toLocaleTimeString()}] Starting ${taskId}`);
    await new Promise((resolve) => setTimeout(resolve, duration));
    console.log(`[${new Date().toLocaleTimeString()}] Completed ${taskId}`);
    const endTime = new Date();
    const executionTime = (endTime - startTime) / 1000;
    console.log(`Execution time: ${executionTime}s`);
    await client.set(`task:${taskId}:status`, 'completed', { EX: expiresIn });
};

// Express app setup
const app = express();
app.use(express.json());

/**
 * Route to add tasks to the queue
 */
app.post('/tasks', async (req, res) => {
    const { taskId } = req.body;
    queueProcess(taskId);
    res.send(`Task [${taskId}] added to the queue.\n`);
});

/**
 * Route to check the queue status
 */
app.get('/queue', async (req, res) => {
    const { taskId } = req.query;
    const status = await client.get(`task:${taskId}:status`);
    res.json(status);
});

/**
 * Process the queue
 * @param {string} taskId - The ID of the task
 */
const queueProcess = async (taskId) => {
    const duration = 1000 * 60; // Adjust the duration as per your needs
    const me = Symbol();
    await queue.wait(me, QUEUE_PRIORITY);
    try {
        await simulateTask(taskId, duration);
    } catch (error) {
        console.error(error);
        await client.set(`task:${taskId}:status`, 'error', { EX: expiresIn });
        await client.set(`task:${taskId}:message`, error.message || error, { EX: expiresIn });
    } finally {
        queue.end(me);
    }
};

// Start the server
const port = 2000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Initialize Redis client
const init = async () => {
    await client.connect();
};
init().catch((err) => console.log(err));

// Redis event handlers
client.on('connect', () => {
    console.log('Client connected to Redis...');
});

client.on('end', () => {
    console.log('Client disconnected from Redis.');
});

client.on('error', (err) => {
    console.log(err.message);
});

// Handle SIGINT signal
process.on('SIGINT', () => {
    client.quit();
});
