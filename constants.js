import dotenv from 'dotenv';
import { cleanEnv, num, port, str } from 'envalid';
dotenv.config();

const constants = cleanEnv(process.env, {
  PORT: port({ default: 3001 }),
  NODE_ENV: str({
    choices: ['development', 'staging', 'production'],
    default: 'development',
  }),
  DB_URI: str(),
  WORKER_COUNT: num({ default: 4 }),
  MAX_REQUESTS: num({ default: 10 })
});
export default constants;
