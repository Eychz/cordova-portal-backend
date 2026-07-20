import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

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
