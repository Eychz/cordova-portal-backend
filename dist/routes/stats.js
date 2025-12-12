"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statsController_1 = require("../controllers/statsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Admin statistics endpoint
router.get('/admin/stats', auth_1.authenticateToken, statsController_1.getAdminStats);
// Get all users (admin only)
router.get('/users', auth_1.authenticateToken, statsController_1.getAllUsers);
exports.default = router;
