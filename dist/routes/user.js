"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, userController_1.getAllUsers);
router.get('/profile', auth_1.authenticateToken, userController_1.getProfile);
router.get('/me', auth_1.authenticateToken, userController_1.getProfile);
router.put('/profile', auth_1.authenticateToken, userController_1.updateProfile);
router.patch('/me', auth_1.authenticateToken, userController_1.updateProfile);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, userController_1.updateUser);
router.put('/:id/verify', auth_1.authenticateToken, auth_1.requireAdmin, userController_1.verifyUser);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, userController_1.deleteUser);
exports.default = router;
