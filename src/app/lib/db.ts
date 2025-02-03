import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    await mongoose.connect(process.env.DATABASE_URL);
    //will remove this console log later
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
