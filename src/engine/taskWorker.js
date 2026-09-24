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

parentPort.on('message', async data => {
  //data received from main thread worker.postMessage(job.data)
  try {
    const typeOfWork = data.type;
    let result;
    if (typeOfWork === 'image_processing') {
      result = await imageProcessing(data)
    } else {
      result = await reportGeneration(data)
    }
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ success: false, error });
  }
});
