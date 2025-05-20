// logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // capture stack traces
    format.printf(({ timestamp, level, message, stack }) => `${timestamp} [${level.toUpperCase()}] ${stack || message}`)
  ),
  transports: [new transports.Console()],
});

export default logger;
