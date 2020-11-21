const mongoose = require('mongoose')
const { logger } = require('../utils/logger')
 
// import User from './user';
// import Message from './message';
 
const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/chess-app').then(() => logger.info('<<< Conexión exitosa a la base de datos >>>'));
};
 
// const models = { User, Message };
 
module.exports = { connectDb };
 
// export default models;