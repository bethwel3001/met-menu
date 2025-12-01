import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(' MongoDB Connected Successfully');
    console.log(` Database: ${conn.connection.name}`);
    console.log(` Host: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB Connection Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log(' MongoDB Reconnected');
    });

  } catch (error) {
    console.error(' MongoDB Connection Failed:', error.message);
    console.log(' Please ensure:');
    console.log('   - MongoDB is running');
    console.log('   - MONGODB_URI is correct in .env file');
    console.log('   - Network connectivity is available');
    process.exit(1);
  }
};

export default connectDB;