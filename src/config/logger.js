import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console()
    // Add File transports if you want persistent logs
  ]
});

export default logger;
