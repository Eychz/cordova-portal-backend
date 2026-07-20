"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const loginUser = async (email, password) => {
    // Find user
    const user = await database_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }
    // Verify password
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
    return {
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            barangay: user.barangay,
            contactNumber: user.contactNumber,
            role: user.role,
            isVerified: user.isVerified,
            emailVerified: user.emailVerified,
        },
    };
};
exports.loginUser = loginUser;
