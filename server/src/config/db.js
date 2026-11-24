import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medistore';
  try {
    console.log(`[MongoDB]: Connecting to ${uri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ [MongoDB Connection Error]: ${error.message}`);
    console.error(`👉 Please ensure MongoDB is running:`);
    console.error(`   brew services start mongodb-community`);
    console.error(`   or run 'mongod' directly in another terminal.\n`);
    process.exit(1);
  }
};
