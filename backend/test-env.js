import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Environment Variables Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Length:', process.env.MONGODB_URI?.length);
console.log('First 50 chars:', process.env.MONGODB_URI?.substring(0, 50));
