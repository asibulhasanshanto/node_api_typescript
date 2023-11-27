import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/config.env` });
console.log(`${__dirname}/config.env`);
import { logger } from './logger';

process.on('uncaughtException', () => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.on('error', () => {
    process.exit(1);
  });
});

const app = express();
import applyGlobalMiddleware from './startup/global-middleware';
import applyRoutes from './startup/routes';
import dbConnect from './startup/db';

applyGlobalMiddleware(app);
applyRoutes(app);

const PORT: number = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  logger.info(`API is listening in [${process.env.NODE_ENV}] on port ${PORT}`);
  console.log(`${__dirname}/.env.${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.message, err);

  server.close(() => {
    process.exit(1);
  });
});

dbConnect();
