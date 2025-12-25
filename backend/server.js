import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import tutorRoutes from './routes/tutor.routes.js';
import sessionRoutes from './routes/session.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import matchmakerRoutes from './routes/matchmaker.routes.js';
import programRoutes from './routes/program.routes.js';

// Load environment variables (force .env to override existing env)
dotenv.config({ override: true });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Skill-Share API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/matchmaker', matchmakerRoutes);
app.use('/api/programs', programRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`\n✨ Skill-Share API is ready!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
