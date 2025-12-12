"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const resend_1 = require("resend");
// Log email configuration (without sensitive data)
console.log('Email Configuration:', {
    host: process.env.EMAIL_HOST || 'NOT SET',
    port: process.env.EMAIL_PORT || 'NOT SET',
    user: process.env.EMAIL_USER || 'NOT SET',
    from: process.env.EMAIL_FROM || 'NOT SET',
    hasPassword: !!(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD),
    hasResendKey: !!process.env.RESEND_API_KEY
});
// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new resend_1.Resend(process.env.RESEND_API_KEY) : null;
// Fallback SMTP transporter
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true, // Use SSL for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: true
    }
});
const sendVerificationEmail = async (email, code) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Email Verification</h2>
      <p>Thank you for registering with Cordova Municipality Portal.</p>
      <p>Your verification code is:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  `;
    try {
        // Try Resend first if API key is available
        if (resend) {
            console.log('Sending verification email via Resend API...');
            const result = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'Email Verification - Cordova Municipality Portal',
                html: htmlContent,
            });
            console.log('Verification email sent successfully via Resend:', result.data?.id);
            return result;
        }
        // Fallback to SMTP
        console.log('Sending verification email via SMTP...');
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Email Verification - Cordova Municipality Portal',
            html: htmlContent,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully via SMTP:', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email. Please check email configuration.');
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, code) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Password Reset Request</h2>
      <p>We received a request to reset your password.</p>
      <p>Your password reset code is:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;
    try {
        // Try Resend first if API key is available
        if (resend) {
            console.log('Sending password reset email via Resend API...');
            const result = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'Password Reset - Cordova Municipality Portal',
                html: htmlContent,
            });
            console.log('Password reset email sent successfully via Resend:', result.data?.id);
            return result;
        }
        // Fallback to SMTP
        console.log('Sending password reset email via SMTP...');
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset - Cordova Municipality Portal',
            html: htmlContent,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully via SMTP:', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new Error('Failed to send password reset email. Please check email configuration.');
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
