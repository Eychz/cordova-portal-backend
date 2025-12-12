"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const database_1 = __importDefault(require("../config/database"));
const getUserProfile = async (userId) => {
    const user = await database_1.default.user.findUnique({
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
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    return user;
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (userId, data) => {
    const user = await database_1.default.user.update({
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
exports.updateUserProfile = updateUserProfile;
