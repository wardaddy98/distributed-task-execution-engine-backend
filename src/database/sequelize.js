import { Sequelize } from "sequelize";
import constants from "../../constants.js";

const DB_URI = constants.DB_URI;
const sequelize = new Sequelize(DB_URI, {
    dialect: 'mysql'
})


export default sequelize