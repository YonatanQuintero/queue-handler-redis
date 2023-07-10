**README.md**

## Long-Running Task Queue with Redis and Express

This is a Node.js application that demonstrates how to create a long-running task queue using Redis and Express. It uses the `async-await-queue` library for managing the queue and Redis as the storage backend.

### Prerequisites

Before running the application, make sure you have the following prerequisites installed:

- Node.js
- Redis

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/YonatanQuintero/queue-handler-redis.git
   ```

2. Install the dependencies:

   ```
   cd queue-handler-redis
   npm install
   ```

3. Start Redis server:

   ```
   redis-server
   ```

4. Start the application:

   ```
   node app.js
   ```

### Usage

Once the application is running, you can interact with it using the following endpoints:

- **POST /tasks**: Add a task to the queue.

  Request Body:

  ```
  {
    "taskId": "Task1"
  }
  ```

- **GET /queue**: Check the status of a task in the queue.

  Query Parameters:

  - `taskId`: The ID of the task.

### License

This project is licensed under the [MIT License](LICENSE).

---
