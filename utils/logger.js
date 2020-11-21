const winston = require('winston')

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf((info) => {
          const {
            timestamp, level, message, ...args
          } = info;
    
          const ts = timestamp.slice(0, 19).replace('T', ' ');
          return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        }),
      ),
    }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})


module.exports = {
  logger
}

