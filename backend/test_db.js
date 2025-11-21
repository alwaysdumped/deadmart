import mongoose from 'mongoose';

const mongoUri = 'mongodb://localhost:27017/livemart';

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
