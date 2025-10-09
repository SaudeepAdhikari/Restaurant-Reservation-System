import winston from 'winston';

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define which level to use based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define custom formats
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    // Mask sensitive data
    let message = info.message;
    
    // Check if the message contains an email and mask it
    if (typeof message === 'string') {
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
      message = message.replace(emailRegex, (email) => {
        const [name, domain] = email.split('@');
        return `${name.substring(0, 2)}***@${domain}`;
      });

      // Mask password references
      message = message.replace(/password.*?:/gi, 'password: [REDACTED]');
      message = message.replace(/token.*?:/gi, 'token: [REDACTED]');
    }

    return `${info.timestamp} ${info.level}: ${message}`;
  }),
  winston.format.colorize({ all: true })
);

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports: [
    // Write logs to console
    new winston.transports.Console(),
    // Write error logs to a file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Write all logs to a combined file
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Create a stream object for Morgan HTTP request logging
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;