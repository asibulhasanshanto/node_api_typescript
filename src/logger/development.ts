import { createLogger, format, transports } from 'winston';

const customFormat = format.printf(
  ({ level, message, timestamp }: { level: string; message: string; timestamp: string }) => {
    return `${timestamp} [${level}]: ${message}`;
  }
);

export const developmentLogger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'boilerplate' },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.timestamp({ format: 'HH:mm:ss' }), customFormat),
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});
