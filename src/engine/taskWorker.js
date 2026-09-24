import { parentPort } from 'worker_threads';

async function imageProcessing() {
  //30 seconds sleep for image processing
  return new Promise(resolve => {
    setTimeout(resolve, 30000)
  })
}

async function reportGeneration() {
  //35 seconds sleep for report generation
  return new Promise(resolve => {
    setTimeout(resolve, 35000)
  })
}

async function deliberateFailTask() {
  //15 seconds sleep and then fail, used to exercise the retry and dead letter queue flow
  return new Promise((_, reject) => {
    setTimeout(() => reject('Task failed deliberately'), 15000)
  })
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
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ success: false, error });
  }
});
