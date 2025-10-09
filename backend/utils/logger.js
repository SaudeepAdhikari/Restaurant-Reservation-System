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
      
      // Mask cookie information
      message = message.replace(/cookie.*?:/gi, 'cookie: [REDACTED]');
      message = message.replace(/Cookie.*?:/gi, 'Cookie: [REDACTED]');
      message = message.replace(/Cookie.*?(Present|None)/gi, 'Cookie: [REDACTED]');
      
      // Mask origin information
      message = message.replace(/origin.*?:/gi, 'origin: [REDACTED]');
      message = message.replace(/Origin.*?:/gi, 'Origin: [REDACTED]');
      message = message.replace(/Origin: http:\/\/.*?(\s|$)/gi, 'Origin: [REDACTED] ');
    }

    return `${info.timestamp} ${info.level}: ${message}`;
  }),
  winston.format.colorize({ all: true })
);

// Create the logger with environment-specific console output
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports: [
    // In production, only show errors and warnings in console
    // In development, show all logs but debug
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    }),
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