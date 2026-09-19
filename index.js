import cors from "cors";
import express from "express";
import helmet from "helmet";
import constants from "./constants.js";
import BaseRouter from './src/baseRouter.js';
import sequelize from './src/database/sequelize.js';
import { handleError } from "./src/middlewares/handleError.js";


const PORT = constants.PORT;

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync()
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})()


const app = express();


app.use(cors({
    origin: '*'
}))

app.use(helmet());
app.use(express.json());


app.use('/', BaseRouter)

//global error handler middleware
app.use(handleError);


app.listen(PORT, () => {
    console.log(`Server live on ${PORT}`)
})

