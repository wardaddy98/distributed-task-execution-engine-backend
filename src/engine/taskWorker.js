import { parentPort } from 'worker_threads';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

//simulates work for durationMs, reporting progress to the main thread every 10%
//progress stops at 90, the main thread sets 100 once the task completes
async function simulateWork(durationMs, { fail = false } = {}) {

  for (let tick = 1; tick <= 10; tick++) {
    await sleep(durationMs / 10);
    if (tick < 10) {
      parentPort.postMessage({ type: 'progress', progress: tick * 10 });
    }
  }

  if (fail) throw 'Task failed deliberately';
}

async function imageProcessing() {
  //30 seconds of work for image processing
  return simulateWork(30000);
}

async function reportGeneration() {
  //35 seconds of work for report generation
  return simulateWork(35000);
}

async function deliberateFailTask() {
  //15 seconds of work and then fail, used to exercise the retry and dead letter queue flow
  return simulateWork(15000, { fail: true });
}

parentPort.on('message', async taskObj => {
  //data received from main thread worker.postMessage(job.data.toJSON())
  try {
    const typeOfWork = taskObj.type;
    let result;
    if (typeOfWork === 'image_processing') {
      result = await imageProcessing(taskObj)
    } else if (typeOfWork === 'deliberate_fail_task') {
      result = await deliberateFailTask(taskObj)
    } else {
      result = await reportGeneration(taskObj)
    }
    parentPort.postMessage({ type: 'result', success: true, result });
  } catch (error) {
    parentPort.postMessage({ type: 'result', success: false, error });
  }
});
