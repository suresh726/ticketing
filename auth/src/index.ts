import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('Starting final automatic deployed auth service...');
  
  if (!process.env.JWT_KEY) {
    throw new Error('JWT Key is not defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI is not defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to mongodb');
  } catch (err) {
    console.error(err)
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!');
  });
};

start();
