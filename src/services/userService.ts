import prisma from '../config/database';

export const getUserProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      middleName: true,
      lastName: true,
      barangay: true,
      contactNumber: true,
      profileImageUrl: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUserProfile = async (userId: number, data: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  barangay?: string;
  contactNumber?: string;
  profileImageUrl?: string;
  frontIdDocumentUrl?: string;
  backIdDocumentUrl?: string;
  faceVerificationUrl?: string;
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      middleName: true,
      lastName: true,
      barangay: true,
      contactNumber: true,
      profileImageUrl: true,
      role: true,
      isVerified: true,
      frontIdDocumentUrl: true,
      backIdDocumentUrl: true,
      faceVerificationUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};
