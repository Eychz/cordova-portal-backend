import dotenv from 'dotenv';
dotenv.config();

// Fail-closed JWT_SECRET check
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET environment variable is not defined!');
  process.exit(1);
}

import express from 'express';
import http from 'http';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';

import postRoutes from './routes/post';
import statsRoutes from './routes/stats';
import uploadRoutes from './routes/upload';
import adminActivityRoutes from './routes/adminActivity';
import serviceRoutes from './routes/service';
// import serviceRequestRoutes from './routes/serviceRequest';
import officialRoutes from './routes/official';
import emergencyRoutes from './routes/emergency';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS Configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
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
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Blocked by CORS policy'));
      } else {
        callback(null, true); // Allow in development
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/posts', postRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin-activities', adminActivityRoutes);
app.use('/api/services', serviceRoutes);
// app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/officials', officialRoutes);
app.use('/api/emergency', emergencyRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
