"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Fail-closed JWT_SECRET check
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET environment variable is not defined!');
    process.exit(1);
}
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const post_1 = __importDefault(require("./routes/post"));
const stats_1 = __importDefault(require("./routes/stats"));
const upload_1 = __importDefault(require("./routes/upload"));
const adminActivity_1 = __importDefault(require("./routes/adminActivity"));
const service_1 = __importDefault(require("./routes/service"));
// import serviceRequestRoutes from './routes/serviceRequest';
const official_1 = __importDefault(require("./routes/official"));
const emergency_1 = __importDefault(require("./routes/emergency"));
const changeLog_1 = __importDefault(require("./routes/changeLog"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
// Trust proxy for rate limiting behind reverse proxies (e.g. Nginx, Vercel, Render)
app.set('trust proxy', 1);
// CORS Configuration for production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://municipality-cordova-portal.vercel.app',
    process.env.FRONTEND_URL || '',
].filter(Boolean);
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            if (process.env.NODE_ENV === 'production') {
                callback(new Error('Blocked by CORS policy'));
            }
            else {
                callback(null, true); // Allow in development
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Recaptcha-Token']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Global Rate Limiter for all /api endpoints
app.use('/api', rateLimiter_1.globalLimiter);
// Specific Tiered Rate Limiters
app.use('/api/auth', rateLimiter_1.authLimiter, auth_1.default);
app.use('/api/upload', rateLimiter_1.uploadLimiter, upload_1.default);
// Routes
app.use('/api/users', user_1.default);
app.use('/api/posts', post_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/admin-activities', adminActivity_1.default);
app.use('/api/services', service_1.default);
app.use('/api/officials', official_1.default);
app.use('/api/emergency', emergency_1.default);
app.use('/api/change-logs', changeLog_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});
// Error handler
app.use((err, req, res, next) => {
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
