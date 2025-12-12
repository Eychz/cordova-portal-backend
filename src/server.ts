import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import eventRoutes from './routes/event';
import postRoutes from './routes/post';
import statsRoutes from './routes/stats';
import uploadRoutes from './routes/upload';
import serviceRequestRoutes from './routes/serviceRequest';
import adminActivityRoutes from './routes/adminActivity';
import notificationRoutes from './routes/notification';
import videoHighlightRoutes from './routes/videoHighlight';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://municipality-cordova-portal.vercel.app',
  process.env.FRONTEND_URL || '',
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, true); // Allow in development, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/admin-activities', adminActivityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/video-highlights', videoHighlightRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
