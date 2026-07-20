import { Request, Response } from 'express';
import * as authService from '../services/authService';

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
    res.status(error.statusCode || 500).json({ error: error.message || 'Login failed' });
  }
};

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    // User object is attached by authenticateToken middleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user session' });
  }
};
