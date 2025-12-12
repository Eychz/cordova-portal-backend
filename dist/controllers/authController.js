"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.resendVerification = exports.verifyEmail = exports.register = void 0;
const authService = __importStar(require("../services/authService"));
const register = async (req, res) => {
    try {
        const { email, password, firstName, middleName, lastName, barangay, contactNumber } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        console.log('Register controller received:', { email, firstName, middleName, lastName, barangay, contactNumber });
        const result = await authService.registerUser({
            email,
            password,
            firstName,
            middleName,
            lastName,
            barangay,
            contactNumber
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Registration failed' });
    }
};
exports.register = register;
const verifyEmail = async (req, res) => {
    try {
        const { userId, code } = req.body;
        if (!userId || !code) {
            return res.status(400).json({ error: 'User ID and code are required' });
        }
        const result = await authService.verifyUserEmail(parseInt(userId), code);
        res.json(result);
    }
    catch (error) {
        console.error('Verification error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Verification failed' });
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await authService.resendVerificationCode(email);
        res.json(result);
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to resend verification code' });
    }
};
exports.resendVerification = resendVerification;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const result = await authService.loginUser(email, password);
        res.json(result);
    }
    catch (error) {
        console.error('Login error:', error);
        // If email is not verified, return userId along with error
        if (error.requiresVerification) {
            return res.status(error.statusCode || 403).json({
                error: error.message || 'Login failed',
                requiresVerification: true,
                userId: error.userId
            });
        }
        res.status(error.statusCode || 500).json({ error: error.message || 'Login failed' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await authService.requestPasswordReset(email);
        res.json(result);
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Request failed' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, code, and new password are required' });
        }
        const result = await authService.resetUserPassword(email, code, newPassword);
        res.json(result);
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Password reset failed' });
    }
};
exports.resetPassword = resetPassword;
