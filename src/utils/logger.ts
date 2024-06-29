import winston from 'winston';

// Define the Winston logger configuration
const logger = winston.createLogger({
    level: 'error', // Set log level to error
    format: winston.format.json(), // JSON format for logs
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }) // Log errors to a file named error.log
    ]
});

// If we're not in production then log to the `console` with the format:
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;
