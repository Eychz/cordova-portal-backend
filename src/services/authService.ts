import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { generateVerificationCode } from '../utils/helpers';

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  barangay?: string;
  contactNumber?: string;
  role?: string;
}

export const registerUser = async (data: RegisterData) => {
  const { email, password, firstName, middleName, lastName, barangay, contactNumber, role } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error: any = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  console.log('Creating user with barangay:', barangay); // Debug log
  const user = await prisma.user.create({
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
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      code,
      type: 'email_verification',
      expiresAt,
    },
  });

  // Send verification email
  await sendVerificationEmail(email, code);

  return {
    message: 'Registration successful. Please check your email for verification code.',
    userId: user.id,
  };
};

export const verifyUserEmail = async (userId: number, code: string) => {
  // Find verification code
  const verificationCode = await prisma.verificationCode.findFirst({
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
    const error: any = new Error('Invalid or expired verification code');
    error.statusCode = 400;
    throw error;
  }

  // Update user: only verify email, NOT citizen status
  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true }, // Only set emailVerified, NOT isVerified
  });

  // Mark code as used
  await prisma.verificationCode.update({
    where: { id: verificationCode.id },
    data: { used: true },
  });

  // Generate JWT token for auto-login
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );

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

export const loginUser = async (email: string, password: string) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error: any = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    const error: any = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    // Generate verification code for resend
    const existingCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        type: 'email_verification',
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    const error: any = new Error('Email not verified');
    error.statusCode = 403;
    error.requiresVerification = true;
    error.userId = user.id;
    throw error;
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );

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

export const requestPasswordReset = async (email: string) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if email exists or not
    return { message: 'If the email exists, a reset code has been sent.' };
  }

  // Generate reset code
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      code,
      type: 'password_reset',
      expiresAt,
    },
  });

  // Send reset email
  await sendPasswordResetEmail(email, code);

  return { message: 'If the email exists, a reset code has been sent.' };
};

export const resetUserPassword = async (email: string, code: string, newPassword: string) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error: any = new Error('Invalid request');
    error.statusCode = 400;
    throw error;
  }

  // Find verification code
  const verificationCode = await prisma.verificationCode.findFirst({
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
    const error: any = new Error('Invalid or expired reset code');
    error.statusCode = 400;
    throw error;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Mark code as used
  await prisma.verificationCode.update({
    where: { id: verificationCode.id },
    data: { used: true },
  });

  return { message: 'Password reset successful' };
};

export const resendVerificationCode = async (email: string) => {
  // Find user by email
  const user = await prisma.user.findUnique({
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
  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      code: verificationCode,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      used: false,
    },
  });

  // Send email with verification code
  await sendVerificationEmail(email, verificationCode);

  return { message: 'Verification code sent to your email' };
};
