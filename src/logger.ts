import { format, createLogger, transports } from 'winston';

export const logger = createLogger({
  format: format.printf(({ message }) => message),
  transports: [new transports.Console(), new transports.File({ filename: 'packageManager.log' })]
});
