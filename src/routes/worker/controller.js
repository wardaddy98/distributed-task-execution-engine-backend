import { workerPool } from "../../../index.js";
import { workerEvents } from "../../engine/workerEvents.js";

// SSE stream: pushes worker counts ({ total, idle, busy }) to all connected clients.
export const handleWorkerEvents = (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    res.flushHeaders();
    res.write('retry: 3000\n\n');

    const send = workerData => res.write(`event: worker\ndata: ${JSON.stringify(workerData)}\n\n`);
    workerEvents.on('worker', send);

    // Send the current counts right away; later updates only fire when a worker changes state.
    if (workerPool) send(workerPool.getWorkerCounts());

    // Comment frames keep idle connections from being closed by proxies.
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);

    req.on('close', () => {
        clearInterval(heartbeat);
        workerEvents.off('worker', send);
    });
};
