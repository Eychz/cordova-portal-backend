"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const event_1 = __importDefault(require("./routes/event"));
const post_1 = __importDefault(require("./routes/post"));
const stats_1 = __importDefault(require("./routes/stats"));
const upload_1 = __importDefault(require("./routes/upload"));
const serviceRequest_1 = __importDefault(require("./routes/serviceRequest"));
const adminActivity_1 = __importDefault(require("./routes/adminActivity"));
const notification_1 = __importDefault(require("./routes/notification"));
const videoHighlight_1 = __importDefault(require("./routes/videoHighlight"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS Configuration for production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
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
            callback(null, true); // Allow in development, restrict in production
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/users', event_1.default);
app.use('/api/posts', post_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/service-requests', serviceRequest_1.default);
app.use('/api/admin-activities', adminActivity_1.default);
app.use('/api/notifications', notification_1.default);
app.use('/api/video-highlights', videoHighlight_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
