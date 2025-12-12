"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Profile image upload (single file)
router.post('/profile-image', auth_1.authenticateToken, (0, upload_1.uploadSingle)('image'), uploadController_1.uploadProfileImage);
// Post images upload (multiple files, max 5)
router.post('/post-images', auth_1.authenticateToken, (0, upload_1.uploadMultiple)('images', 5), uploadController_1.uploadPostImages);
// Delete image
router.delete('/image', auth_1.authenticateToken, uploadController_1.deleteImage);
exports.default = router;
