import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Registration failed' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and code are required' });
    }

    const result = await authService.verifyUserEmail(parseInt(userId), code);
    res.json(result);
  } catch (error: any) {
    console.error('Verification error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Verification failed' });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.resendVerificationCode(email);
    res.json(result);
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to resend verification code' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (error: any) {
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const result = await authService.resetUserPassword(email, code, newPassword);
    res.json(result);
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Password reset failed' });
  }
};
