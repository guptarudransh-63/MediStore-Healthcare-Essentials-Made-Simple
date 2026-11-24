import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables before other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5088;

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded prescriptions and product images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MediStore Pharmacy SaaS API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`💊 [MediStore Server] Started Successfully`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ [MediStore Server Error]: Port ${PORT} is already in use by another process.`);
    console.error(`   To free port ${PORT}, run: lsof -ti:${PORT} | xargs kill -9\n`);
  } else {
    console.error(`\n❌ [MediStore Server Error]:`, error.message, `\n`);
  }
});

export default app;
