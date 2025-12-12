"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationCode = exports.resetUserPassword = exports.requestPasswordReset = exports.loginUser = exports.verifyUserEmail = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const email_1 = require("../utils/email");
const helpers_1 = require("../utils/helpers");
const registerUser = async (data) => {
    const { email, password, firstName, middleName, lastName, barangay, contactNumber, role } = data;
    // Check if user already exists
    const existingUser = await database_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        const error = new Error('Email already registered');
        error.statusCode = 400;
        throw error;
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // Create user
    console.log('Creating user with barangay:', barangay); // Debug log
    const user = await database_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            middleName,
            lastName,
            barangay,
            contactNumber,
            role: role || 'citizen',
            isVerified: false,
        },
    });
    console.log('User created with barangay:', user.barangay); // Debug log
    // Generate verification code
    const code = (0, helpers_1.generateVerificationCode)();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await database_1.default.verificationCode.create({
        data: {
            userId: user.id,
            code,
            type: 'email_verification',
            expiresAt,
        },
    });
    // Send verification email
    await (0, email_1.sendVerificationEmail)(email, code);
    return {
        message: 'Registration successful. Please check your email for verification code.',
        userId: user.id,
    };
};
exports.registerUser = registerUser;
const verifyUserEmail = async (userId, code) => {
    // Find verification code
    const verificationCode = await database_1.default.verificationCode.findFirst({
        where: {
            userId,
            code,
            type: 'email_verification',
            used: false,
            expiresAt: {
                gt: new Date(),
            },
        },
    });
    if (!verificationCode) {
        const error = new Error('Invalid or expired verification code');
        error.statusCode = 400;
        throw error;
    }
    // Update user: only verify email, NOT citizen status
    const user = await database_1.default.user.update({
        where: { id: userId },
        data: { emailVerified: true }, // Only set emailVerified, NOT isVerified
    });
    // Mark code as used
    await database_1.default.verificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
    });
    // Generate JWT token for auto-login
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    return {
        message: 'Email verified successfully',
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            barangay: user.barangay,
            role: user.role,
            emailVerified: user.emailVerified,
            isVerified: user.isVerified
        }
    };
};
exports.verifyUserEmail = verifyUserEmail;
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
    // Check if email is verified
    if (!user.emailVerified) {
        // Generate verification code for resend
        const existingCode = await database_1.default.verificationCode.findFirst({
            where: {
                userId: user.id,
                type: 'email_verification',
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        const error = new Error('Email not verified');
        error.statusCode = 403;
        error.requiresVerification = true;
        error.userId = user.id;
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
const requestPasswordReset = async (email) => {
    // Find user
    const user = await database_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        // Don't reveal if email exists or not
        return { message: 'If the email exists, a reset code has been sent.' };
    }
    // Generate reset code
    const code = (0, helpers_1.generateVerificationCode)();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await database_1.default.verificationCode.create({
        data: {
            userId: user.id,
            code,
            type: 'password_reset',
            expiresAt,
        },
    });
    // Send reset email
    await (0, email_1.sendPasswordResetEmail)(email, code);
    return { message: 'If the email exists, a reset code has been sent.' };
};
exports.requestPasswordReset = requestPasswordReset;
const resetUserPassword = async (email, code, newPassword) => {
    // Find user
    const user = await database_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        const error = new Error('Invalid request');
        error.statusCode = 400;
        throw error;
    }
    // Find verification code
    const verificationCode = await database_1.default.verificationCode.findFirst({
        where: {
            userId: user.id,
            code,
            type: 'password_reset',
            used: false,
            expiresAt: {
                gt: new Date(),
            },
        },
    });
    if (!verificationCode) {
        const error = new Error('Invalid or expired reset code');
        error.statusCode = 400;
        throw error;
    }
    // Hash new password
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // Update password
    await database_1.default.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
    // Mark code as used
    await database_1.default.verificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
    });
    return { message: 'Password reset successful' };
};
exports.resetUserPassword = resetUserPassword;
const resendVerificationCode = async (email) => {
    // Find user by email
    const user = await database_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Check if email is already verified
    if (user.emailVerified) {
        throw new Error('Email already verified');
    }
    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Create verification code record with 10-minute expiry
    await database_1.default.verificationCode.create({
        data: {
            userId: user.id,
            code: verificationCode,
            type: 'email_verification',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            used: false,
        },
    });
    // Send email with verification code
    await (0, email_1.sendVerificationEmail)(email, verificationCode);
    return { message: 'Verification code sent to your email' };
};
exports.resendVerificationCode = resendVerificationCode;
