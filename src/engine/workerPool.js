import { Worker } from 'worker_threads';
import { BadRequestError } from '../middlewares/handleError.js';

//dequeue
//per-client rate limiting on task submission — max 10 tasks per minute per client (clients are
// identified by API key
//Fair scheduling — no single client should be able to starve others by flooding the queue with high
// priority tasks. 


//update task status- 'queued', 'running', 'completed', 'cancelled', 'failed', 'dead'
//retry task- maintain another queue for failed tasks , check retries and push in current pool

//dlq - task with status dead, implement dunction to trigger pushing into pool


//sse 

class WorkerPool {

  constructor(workerScriptPath, poolSize) {
    this.workerScriptPath = workerScriptPath;
    this.poolSize = poolSize;
    this.workers = [];
    this.freeWorkers = [];
    this.queue = [];

    for (let i = 0; i < poolSize; i++) {
      this.createWorker();
    }
  }

  createWorker() {
    const worker = new Worker(this.workerScriptPath);

    worker.on('message', async ({ success, result, error }) => {
      //{success, result, error} is the result received from worker file after performing calculation 
      const job = worker.currentJob;
      worker.currentJob = null;

      //job is null if the task was cancelled while this message was in flight
      if (!job) return;

      if (success) {
        //resolve if {success:true} returned from worker file
        job.data.status = 'completed';
        await job.data.save();

        //SG-FIX emit completed

        job?.resolve(result);
      } else {
        //reject if {success:false} returned from worker file

        job.data.status = 'failed';
        await job.data.save();

        //SG-FIX emit failed

        job?.reject(error);

        this.retryJob(job.data)
      }
      this.releaseWorker(worker);
    });

    //this will catch uncaught errors when worker crashed
    worker.on('error', error => {
      const job = worker?.currentJob;
      worker.currentJob = null;
      if (job) {
        job?.reject(error);
        this.retryJob(job.data)
      }
      this.replaceDeadWorker(worker);
    });

    this.workers.push(worker);
    this.freeWorkers.push(worker);
  }

  async retryJob(task) {
    if (task.retries <= 3) {
      this.queueTask(task)
      await task.increment('retries', { by: 1 })
    } else {
      // if max retries reached update status to dead, to represent dlq
      task.status = 'dead';
      await task.save
    }

  }

  //when a worker crashes, terminate it and create new worker, and assign it a task if it exists in the queue
  replaceDeadWorker(worker) {
    this.workers = this.workers.filter(w => w !== worker);
    worker.terminate();
    this.createWorker();
    this.runNextTask();
  }

  releaseWorker(worker) {
    this.freeWorkers.push(worker);
    this.runNextTask();
  }

  //if worker and task exist, assign task to worker
  async runNextTask() {
    if (this.queue.length === 0 || this.freeWorkers.length === 0) return;

    const worker = this.freeWorkers.shift();
    const job = this.queue.shift();
    worker.currentJob = job;

    //update task status in db
    job.data.status = 'running';
    await job.data.save();

    //SG-FIX emit running

    worker.postMessage(job.data);
  }

  queueTask(taskData) {
    return new Promise((resolve, reject) => {
      const task = { data: taskData, resolve, reject }

      const priority = taskData.priority;

      //find index of first element with priority less than current priority
      const index = this.queue.findIndex(currentTask => currentTask.data.priority < priority);

      if (index === -1) {
        //all current tasks have higher or same priority, so push at end of the queue
        //in case of same priority existing tasks will follow fifo and new task will come at the end
        this.queue.push(task)
      } else {

        //add the task at the first position where priority was less than current priority
        this.queue.splice(index, 0, task)
      }

      this.runNextTask();
    });
  }

  async terminatePool() {
    await Promise.all(this.workers.map(worker => worker.terminate()));
  }
}

export default WorkerPool;
