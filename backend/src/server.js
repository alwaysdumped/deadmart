import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import config from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import addressRoutes from './routes/addresses.js';
import paymentMethodRoutes from './routes/paymentMethods.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Root route for health checks
app.get('/', (req, res) => {
  res.status(200).send('Live MART Backend is Running 🚀');
});

// Start server immediately (Optimistic Startup for Railway)
const PORT = config.port || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend: ${config.frontendUrl}`);
  console.log(`📧 Email Config: Host=${config.email.host}, Port=${config.email.port}, User=${config.email.user ? 'Set' : 'Missing'}\n`);
  
  // Connect to MongoDB in background
  connectDB().catch(err => {
    console.error('❌ MongoDB Connection Failed:', err);
    // Optional: process.exit(1) if you want to crash on DB failure, 
    // but keeping it alive might allow health checks to pass while retrying
  });
});
