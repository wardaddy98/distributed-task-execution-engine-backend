import { Worker } from 'worker_threads';
import { emitTaskUpdate } from './taskEvents.js';
import { emitWorkerUpdate } from './workerEvents.js';

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
    this.emitWorkerCounts();
  }
  getWorkerCounts() {
    const total = this.workers.length;
    const idle = this.freeWorkers.length;
    return { total, idle, busy: total - idle };
  }

  // Push the latest counts to every connected /worker/events client.
  emitWorkerCounts() {
    emitWorkerUpdate(this.getWorkerCounts());
  }

  createWorker() {
    const worker = new Worker(this.workerScriptPath);

    worker.on('message', async message => {
      //progress updates keep the worker busy, only persist and emit the new progress
      if (message.type === 'progress') {
        const job = worker.currentJob;
        //job is null if the task was cancelled or already finished
        if (!job) return;

        job.data.progress = message.progress;
        await job.data.save();

        emitTaskUpdate(job.data);
        return;
      }

      //{success, result, error} is the result received from worker file after performing calculation
      const { success, result, error } = message;
      const job = worker.currentJob;
      worker.currentJob = null;

      //job is null if the task was cancelled while this message was in flight
      if (!job) return;

      if (success) {
        //resolve if {success:true} returned from worker file
        job.data.status = 'completed';
        job.data.progress = 100;
        await job.data.save();

        emitTaskUpdate(job.data);

        job?.resolve(result);
      } else {
        //reject if {success:false} returned from worker file

        job.data.status = 'failed';
        await job.data.save();

        emitTaskUpdate(job.data);

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
    if (task.retries < 3) {
      task.retries += 1;
      await task.save();
      emitTaskUpdate(task);
      this.queueTask(task)
    } else {
      // if max retries reached update status to dead, to represent dlq
      task.status = 'dead';
      await task.save()
      emitTaskUpdate(task);
    }

  }

  //when a worker crashes, terminate it and create new worker, and assign it a task if it exists in the queue
  replaceDeadWorker(worker) {
    this.workers = this.workers.filter(w => w !== worker);
    worker.terminate();
    this.createWorker();
    this.emitWorkerCounts();
    this.runNextTask();
  }

  releaseWorker(worker) {
    this.freeWorkers.push(worker);
    this.emitWorkerCounts();
    this.runNextTask();
  }

  //if worker and task exist, assign task to worker
  async runNextTask() {
    if (this.queue.length === 0 || this.freeWorkers.length === 0) return;

    const worker = this.freeWorkers.shift();
    const job = this.queue.shift();
    worker.currentJob = job;
    this.emitWorkerCounts();

    //update task status in db
    job.data.status = 'running';
    //retried tasks start again from 0
    job.data.progress = 0;
    await job.data.save();

    emitTaskUpdate(job.data);

    worker.postMessage(job.data.toJSON());
  }

  queueTask(taskData) {
    const promise = new Promise((resolve, reject) => {
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

    // to handle uncaughtErrorExpression which will be thrown inside controller, if this promise rejects in worker.on
    promise.catch(() => { });
    return promise;
  }

  cancelTask(taskId) {
    // remove task from queue if it exists
    // find worker and terminate worker, create new worker

    const queuedTaskIndex = this.queue.findIndex(task => task.data.id === taskId);

    if (queuedTaskIndex === -1) {
      //task is already working
      const worker = this.workers.find(w => w?.currentJob?.data?.id === taskId);
      if (worker) {
        worker.currentJob?.reject('Task cancelled')
        worker.currentJob = null;
        this.workers = this.workers.filter(w => w !== worker);
        worker.terminate();
        this.createWorker();
        this.emitWorkerCounts();
        this.runNextTask();
      }
    } else {
      const [job] = this.queue.splice(queuedTaskIndex, 1)
      job?.reject('Task Cancelled')
    }

  }

  async terminatePool() {
    await Promise.all(this.workers.map(worker => worker.terminate()));
  }
}

export default WorkerPool;
