import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import constants from './constants.js';
import BaseRouter from './src/baseRouter.js';
import sequelize from './src/database/sequelize.js';
import WorkerPool from './src/engine/workerPool.js';
import { handleError } from './src/middlewares/handleError.js';

const PORT = constants.PORT;
const WORKER_COUNT = constants.WORKER_COUNT;

export let workerPool;

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('Connection has been established successfully.');

        workerPool = new WorkerPool(
            new URL('./src/engine/taskWorker.js', import.meta.url),
            WORKER_COUNT,
        );
        console.log(`Worker pool started with ${constants.WORKER_COUNT} workers.`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

const app = express();

app.use(
    cors({
        origin: '*',
    }),
);

app.use(helmet());
app.use(express.json());

app.use('/', BaseRouter);

//global error handler middleware
app.use(handleError);

app.listen(PORT, () => {
    console.log(`Server live on ${PORT}`);
});
