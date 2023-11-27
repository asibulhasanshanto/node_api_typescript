import { createLogger, format, transports } from 'winston';

const customFormat = format.printf(
  ({ level, message, timestamp }: { level: string; message: string; timestamp: string }) => {
    return `${timestamp} [${level}]: ${message}`;
  }
);

export const productionLogger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(format.timestamp(), customFormat),
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new transports.File({
      filename: 'logs/combined.log',
      level: 'info',
    }),
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
});
